import type { components } from '@/generated-types';

export type ConnectionKind = 'database' | 'object_store' | string;
export type ConnectionMetadata = components['schemas']['ConnectionMetadata'];
export type ListSummary = components['schemas']['ListSummary'];
export type TableSummary = components['schemas']['TableSummary'];
export type QueryRequest = components['schemas']['QueryRequest'];
export type ConnectionDetailQuery = components['schemas']['ConnectionDetailQuery'];
export type ConnectionDetailsRequest = components['schemas']['ConnectionDetailsRequest'];
export type ConnectionDetailsResponse = components['schemas']['ConnectionDetailsResponse'];
