/**
 * @statelyjs/arrow - Arrow Data Plugin
 *
 * Apache Arrow integration plugin for Stately applications. Provides
 * data connectivity and query capabilities for working with Arrow-based
 * data sources.
 *
 * ## Features
 *
 * - **Data Connectors**: Connect to various Arrow-compatible data sources
 * - **Query Execution**: Execute SQL queries against connected data
 * - **Catalog Browsing**: Browse available catalogs and schemas
 * - **Connection Management**: Register and manage data connections
 * - **Streaming Results**: Handle large result sets with Arrow IPC streaming
 *
 * ## Installation
 *
 * ```bash
 * pnpm add @statelyjs/arrow
 * ```
 *
 * ## Setup
 *
 * ### 1. Add Schema Plugin
 *
 * ```typescript
 * import { stately } from '@statelyjs/stately/schema';
 * import { arrowPlugin } from '@statelyjs/arrow';
 *
 * const schema = stately<MySchemas>(openapiDoc, PARSED_SCHEMAS)
 *   .withPlugin(arrowPlugin());
 * ```
 *
 * ### 2. Add UI Plugin
 *
 * ```typescript
 * import { statelyUi } from '@statelyjs/stately';
 * import { arrowUiPlugin } from '@statelyjs/arrow';
 *
 * const runtime = statelyUi<MySchemas>({ schema, client, options })
 *   .withPlugin(arrowUiPlugin({ api: { pathPrefix: '/arrow' } }));
 * ```
 *
 * ### 3. Access in Components
 *
 * ```typescript
 * const { plugins } = useStatelyUi();
 *
 * // List available connectors
 * const connectors = await plugins.arrow.api.list_connectors();
 *
 * // Execute a query
 * const results = await plugins.arrow.api.execute_query({
 *   body: { sql: 'SELECT * FROM my_table LIMIT 10' }
 * });
 * ```
 *
 * @packageDocumentation
 */

import { arrowPlugin, arrowUiPlugin } from './plugin';

export type { ArrowOptions, ArrowPlugin, ArrowUiPlugin } from './plugin';
export { arrowPlugin, arrowUiPlugin };
