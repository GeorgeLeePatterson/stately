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

const DEFAULT_CHUNK_SIZE: usize = 8 * 1024;

struct ArrowIpcStreamState {
    stream:     SendableRecordBatchStream,
    writer:     StreamWriter<Vec<u8>>,
    chunk_size: usize,
    finished:   bool,
    emitted:    bool,
}

impl ArrowIpcStreamState {
    fn take_chunk(&mut self, force: bool) -> Option<Bytes> {
        let buffer = self.writer.get_mut();
        if buffer.is_empty() || (!force && self.emitted && buffer.len() < self.chunk_size) {
            return None;
        }
        let chunk = buffer.split_off(0);
        self.emitted = true;
        Some(Bytes::from(chunk))
    }
}

pub(super) async fn arrow_ipc_response(stream: SendableRecordBatchStream) -> Result<Response> {
    let schema = stream.schema();
    let writer = StreamWriter::try_new(Vec::with_capacity(DEFAULT_CHUNK_SIZE), &schema)?;
    let state = ArrowIpcStreamState {
        stream,
        writer,
        chunk_size: DEFAULT_CHUNK_SIZE,
        finished: false,
        emitted: false,
    };

    let body = Body::from_stream(stream::try_unfold(state, |mut state| async move {
        loop {
            if let Some(chunk) = state.take_chunk(false) {
                return Ok::<_, Error>(Some((chunk, state)));
            }

            if state.finished {
                return Ok(None);
            }

            if let Some(batch_result) = state.stream.next().await {
                let batch: RecordBatch = batch_result?;
                state.writer.write(&batch)?;
                state.writer.flush()?;
            } else {
                state.writer.finish()?;
                state.finished = true;
                if let Some(chunk) = state.take_chunk(true) {
                    return Ok(Some((chunk, state)));
                }
                return Ok(None);
            }
        }
    }));

    Ok(Response::builder()
        .header(header::CONTENT_TYPE, "application/vnd.apache.arrow.stream")
        .header(header::TRANSFER_ENCODING, "chunked")
        .body(body)
        .unwrap())
}
