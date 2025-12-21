import openapiSpec from '../../../openapi.json';
import type { components, operations, paths } from '../generated/types';
import { PARSED_SCHEMAS, type ParsedSchema } from '../generated/schemas';

import createClient from 'openapi-fetch';
import { statelyUi, statelyUiProvider, useStatelyUi } from '@statelyjs/stately';
import { type DefineConfig, type DefineOperations, type Schemas, stately } from '@statelyjs/stately/schema';
import { Check } from 'lucide-react';

// Create the API client
const client = createClient<paths>({ baseUrl: 'http://localhost:3000' });

// TODO: Remove - (dev) Move the solution to the reason why 'DefineOperations' is used into 'DefineConfig'
// Create derived stately schema
type AppSchemas = Schemas<DefineConfig<components, paths, DefineOperations<operations>, ParsedSchema>>;

// Configure stately application options
const runtimeOpts = {
  client,
  // Pass in derived stately schema
  schema: stately<AppSchemas>(openapiSpec, PARSED_SCHEMAS),
  // Configure application-wide options
  options: { api: { pathPrefix: '/api/v1/entity' } },
  // Configure included core plugin options
  core: { api: { pathPrefix: '/' }, entities: { icons: { task: Check } } },
};

// Create stately runtime
export const runtime = statelyUi<AppSchemas>(runtimeOpts);

// Create application's context provider
export const StatelyProvider = statelyUiProvider<AppSchemas>();
export const useStately = useStatelyUi<AppSchemas>;
