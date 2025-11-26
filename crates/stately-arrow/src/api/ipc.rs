use arrow::ipc::writer::StreamWriter;
use arrow::record_batch::RecordBatch;
use axum::body::Body;
use axum::http::header;
use axum::response::Response;
use bytes::Bytes;
use datafusion::execution::SendableRecordBatchStream;
use futures_util::{StreamExt, stream};

use crate::Error;
use crate::error::Result;

pub const DEFAULT_CHUNK_SIZE: usize = 8 * 1024;

/// Wrapper type to internally manage the state and buffering of an Arrow IPC stream.
///
/// Helps bridge the async/sync gap between arrow's sync primitives and async streaming.
pub struct ArrowIpcStreamState {
    stream:     SendableRecordBatchStream,
    writer:     StreamWriter<Vec<u8>>,
    chunk_size: usize,
    finished:   bool,
    emitted:    bool,
}

impl ArrowIpcStreamState {
    /// Create a new `ArrowIpcStreamState`
    ///
    /// # Errors
    /// - Returns an error if the `StreamWriter` cannot be created
    pub fn try_new(stream: SendableRecordBatchStream, chunk_size: Option<usize>) -> Result<Self> {
        let chunk_size = chunk_size.unwrap_or(DEFAULT_CHUNK_SIZE);
        let schema = stream.schema();
        let writer = StreamWriter::try_new(Vec::with_capacity(chunk_size), &schema)?;
        Ok(Self { stream, writer, chunk_size, finished: false, emitted: false })
    }

    pub fn take_chunk(&mut self, force: bool) -> Option<Bytes> {
        let buffer = self.writer.get_mut();
        if buffer.is_empty() || (!force && self.emitted && buffer.len() < self.chunk_size) {
            return None;
        }
        let chunk = buffer.split_off(0);
        self.emitted = true;
        Some(Bytes::from(chunk))
    }

    #[must_use]
    pub fn take_stream(mut self) -> SendableRecordBatchStream {
        self.finished = true;
        self.stream
    }

    #[must_use]
    pub fn into_parts(mut self) -> (SendableRecordBatchStream, StreamWriter<Vec<u8>>) {
        self.finished = true;
        (self.stream, self.writer)
    }

    pub fn is_finished(&self) -> bool { self.finished }

    pub fn is_emitted(&self) -> bool { self.emitted }

    /// Stream chunks from an Arrow IPC stream state.
    ///
    /// Useful inside of `stream::try_unfold` to convert an Arrow IPC stream state into a stream of
    /// chunks.
    ///
    /// # Errors
    /// - Returns an error if flushing fails
    pub async fn stream_chunks(mut self) -> Result<Option<(Bytes, Self)>> {
        loop {
            if let Some(chunk) = self.take_chunk(false) {
                return Ok::<_, Error>(Some((chunk, self)));
            }

            if self.finished {
                return Ok(None);
            }

            if let Some(batch_result) = self.stream.next().await {
                let batch: RecordBatch = batch_result?;
                self.writer.write(&batch)?;
                self.writer.flush()?;
            } else {
                self.writer.finish()?;
                self.finished = true;
                if let Some(chunk) = self.take_chunk(true) {
                    return Ok(Some((chunk, self)));
                }
                return Ok(None);
            }
        }
    }
}

/// Create an arrow ipc response from a stream of record batches
///
/// # Errors
/// - Returns an error if the stream cannot be converted to an arrow ipc response
///
/// # Panics
/// - Should not panic. The headers provided are valid.
pub async fn arrow_ipc_response(stream: SendableRecordBatchStream) -> Result<Response> {
    let state = ArrowIpcStreamState::try_new(stream, None)?;
    let body =
        Body::from_stream(stream::try_unfold(
            state,
            |state| async move { state.stream_chunks().await },
        ));

    // let body = Body::from_stream(stream::try_unfold(state, |mut state| async move {
    //     loop {
    //         if let Some(chunk) = state.take_chunk(false) {
    //             return Ok::<_, Error>(Some((chunk, state)));
    //         }

    //         if state.finished {
    //             return Ok(None);
    //         }

    //         if let Some(batch_result) = state.stream.next().await {
    //             let batch: RecordBatch = batch_result?;
    //             state.writer.write(&batch)?;
    //             state.writer.flush()?;
    //         } else {
    //             state.writer.finish()?;
    //             state.finished = true;
    //             if let Some(chunk) = state.take_chunk(true) {
    //                 return Ok(Some((chunk, state)));
    //             }
    //             return Ok(None);
    //         }
    //     }
    // }));

    Ok(Response::builder()
        .header(header::CONTENT_TYPE, "application/vnd.apache.arrow.stream")
        .header(header::TRANSFER_ENCODING, "chunked")
        .body(body)
        .unwrap())
}
