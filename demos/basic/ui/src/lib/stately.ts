// Application imports
import { statelyUi, statelyUiProvider, useStatelyUi } from '@statelyjs/stately';
import { type DefineConfig, type Schemas, stately } from '@statelyjs/stately/schema';
import createClient from 'openapi-fetch';

// Generated imports
import openapiSpec from '../../../openapi.json';
import { PARSED_SCHEMAS, type ParsedSchema } from '../generated/schemas';
import type { components, operations, paths } from '../generated/types';

// Create derived stately schema
type AppSchemas = Schemas<DefineConfig<components, paths, operations, ParsedSchema>>;

// Create stately runtime
export const runtime = statelyUi<AppSchemas>({
  client: createClient<paths>({ baseUrl: 'http://localhost:5555/api/entity' }),
  // Pass in derived stately schema
  schema: stately<AppSchemas>(openapiSpec, PARSED_SCHEMAS),
});

// Create application's context provider
export const StatelyProvider = statelyUiProvider<AppSchemas>();
export const useStately = useStatelyUi<AppSchemas>;
