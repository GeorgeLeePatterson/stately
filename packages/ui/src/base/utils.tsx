import type { StatelySchemas } from '@stately/schema/schema';
import { Dot } from 'lucide-react';
import type { ComponentType } from 'react';
import type { AllPlugins, AnyUiPlugin } from './plugin';

export interface UiUtils {
  getNodeTypeIcon: (node: string) => ComponentType<any>;
}

export function runtimeUtils<
  Schema extends StatelySchemas<any, any>,
  Augments extends readonly AnyUiPlugin[],
>(plugins: AllPlugins<Schema, Augments>): UiUtils {
  return {
    getNodeTypeIcon(node: string): ComponentType<any> {
      for (const plugin of Object.values(plugins)) {
        const hook = plugin?.utils?.getNodeTypeIcon;
        if (!hook) continue;
        const icon = hook(node);
        if (icon) {
          return icon;
        }
      }

      return Dot;
    },
  };
}
