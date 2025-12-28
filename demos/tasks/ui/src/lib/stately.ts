import {
  type StatelyConfiguration,
  statelyUi,
  statelyUiProvider,
  useStatelyUi,
} from '@statelyjs/stately';
import { codemirror } from '@statelyjs/stately/features';
import { type DefineConfig, type Schemas, stately } from '@statelyjs/stately/schema';
import { Check, LayoutDashboard } from 'lucide-react';
import createClient from 'openapi-fetch';

import openapiSpec from '../../../openapi.json';
import { PARSED_SCHEMAS, type ParsedSchema } from '../generated/schemas';
import type { components, operations, paths } from '../generated/types';

// Create the API client
export const client = createClient<paths>({ baseUrl: 'http://localhost:3000/api/v1' });

// Create derived stately schema
type AppSchemas = Schemas<DefineConfig<components, paths, operations, ParsedSchema>>;

// Configure stately application options
const runtimeOptions: StatelyConfiguration<AppSchemas> = {
  client,
  // Configure included core plugin options
  core: { api: { pathPrefix: '/entity' }, entities: { icons: { task: Check } } },
  // Configure application-wide options
  options: {
    api: { pathPrefix: '/' },
    navigation: {
      routes: {
        // Any additional routes that should appear in the sidebar
        items: [{ icon: LayoutDashboard, label: 'Dashboard', to: '/' }],
        // Section label for all routes
        label: 'Application',
        to: '/',
      },
    },
  },
  // Pass in derived stately schema
  schema: stately<AppSchemas>(openapiSpec, PARSED_SCHEMAS),
};

// Create stately runtime
export const runtime = statelyUi<AppSchemas>(runtimeOptions);

// Register codemirror plugin
codemirror.enable({
  codemirrorProps: {
    supportedLanguages: ['bash', 'yaml', 'json', 'sql', 'c++', 'markdown'],
    themeOptions: { includeDefaults: true },
  },
});

// Create application's context provider
export const StatelyProvider = statelyUiProvider<AppSchemas>();
export const useStately = useStatelyUi<AppSchemas>;
