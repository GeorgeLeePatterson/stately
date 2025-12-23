/**
 * @statelyjs/arrow - React Hooks
 *
 * @packageDocumentation
 *
 * This module exports React hooks for interacting with Arrow data sources.
 * These hooks provide convenient access to connection management, catalog
 * browsing, and streaming query execution.
 *
 * ## Available Hooks
 *
 * ### API Access
 * - {@link useArrowApi} - Access the Arrow API client
 *
 * ### Connection Management
 * - {@link useListConnectors} - List available data source connectors
 * - {@link useConnectors} - Manage connector selection state
 * - {@link useConnectionDetails} - Get details for a specific connector
 * - {@link useMultiConnectionDetails} - Get details for multiple connectors
 * - {@link useRegisterConnection} - Register a connection with the query engine
 *
 * ### Catalog Operations
 * - {@link useListCatalogs} - List available catalogs
 * - {@link useListRegistered} - List registered connections with categorization
 *
 * ### Query Execution
 * - {@link useStreamingQuery} - Execute streaming SQL queries with Apache Arrow
 *
 * @module
 */

import { useArrowApi } from './use-arrow-api';
import { useConnectionDetails, useMultiConnectionDetails } from './use-connection-details';
import { useConnectors } from './use-connectors';
import { useListCatalogs } from './use-list-catalog';
import { useListConnectors } from './use-list-connections';
import { useListRegistered } from './use-list-registered';
import { useRegisterConnection } from './use-register-connection';
import { STREAMING_QUERY_KEY, streamQueryOptions, useStreamingQuery } from './use-streaming-query';

export type { UseConnectors } from './use-connectors';
export type { CatalogRegistration } from './use-list-registered';
export type { UseStreamingQueryResult } from './use-streaming-query';

export {
  useArrowApi,
  useConnectionDetails,
  useConnectors,
  useListCatalogs,
  useListConnectors,
  useListRegistered,
  useMultiConnectionDetails,
  useRegisterConnection,
  useStreamingQuery,
  streamQueryOptions,
  STREAMING_QUERY_KEY,
};
