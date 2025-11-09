import type { StatelyUiPlugin } from '@stately/ui';
import { useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { FilesNodeType } from './schema.js';
import type { FilesApiOperationIds } from './lib/files-api.js';

type RelativePathValue = string | { dir?: string; path?: string } | null | undefined;

type PrimitiveStringTransformerProps = {
  formId: string;
  value: RelativePathValue;
  onChange: (value: RelativePathValue) => void;
  placeholder?: string;
  stately?: {
    mode?: string;
    setMode?: (mode: string) => void;
    modes?: Array<{ value: string; icon: ComponentType<any>; label: string; description: string }>;
    component?: ReactNode;
    after?: ReactNode;
  };
};

const RelativePathModeIcon = () => (
  <span className="text-xs font-semibold">RP</span>
);

const RelativePathEdit = ({
  formId,
  value,
  onChange,
  placeholder,
}: {
  formId: string;
  value: RelativePathValue;
  onChange: (value: RelativePathValue) => void;
  placeholder?: string;
}) => {
  const [useObject, setUseObject] = useState(typeof value === 'object' && value !== null);
  const resolved = typeof value === 'string' || !value ? value : value.path;

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <label htmlFor={`${formId}-relative-path`}>Relative Path</label>
        <label className="flex items-center gap-1 text-[11px]">
          <input
            type="checkbox"
            checked={useObject}
            onChange={event => {
              setUseObject(event.target.checked);
              if (!event.target.checked && typeof value === 'object' && value !== null) {
                onChange(value.path ?? '');
              }
            }}
          />
          Managed path
        </label>
      </div>
      <div className="flex w-full gap-2">
        {useObject && (
          <select
            aria-label="Directory"
            className="rounded border px-2 py-1 text-sm"
            value={(value && typeof value === 'object' && value.dir) || 'data'}
            onChange={event =>
              onChange({ dir: event.target.value, path: typeof value === 'object' ? value?.path ?? '' : resolved ?? '' })
            }
          >
            <option value="data">data</option>
            <option value="upload">upload</option>
            <option value="cache">cache</option>
            <option value="config">config</option>
          </select>
        )}
        <input
          id={`${formId}-relative-path`}
          className="flex-1 rounded border px-2 py-1 text-sm"
          placeholder={placeholder || 'data/pipelines/config.json'}
          value={resolved ?? ''}
          onChange={event => {
            if (useObject) {
              onChange({ dir: (typeof value === 'object' && value?.dir) || 'data', path: event.target.value });
            } else {
              onChange(event.target.value);
            }
          }}
        />
      </div>
    </div>
  );
};

const RelativePathView = ({ value }: { value: RelativePathValue }) => {
  const display = useMemo(() => {
    if (!value) return '—';
    if (typeof value === 'string') return value;
    const dir = value.dir ? `${value.dir}:` : '';
    return `${dir}${value.path ?? ''}`;
  }, [value]);

  return <code className="text-xs font-mono break-all">{display}</code>;
};

const primitiveStringTransformer = (props: PrimitiveStringTransformerProps) => {
  const stately = props.stately ?? {};
  const nextModes = stately.modes ?? [];
  const alreadyRegistered = nextModes.some(mode => mode.value === 'relative-path');
  const modes = alreadyRegistered
    ? nextModes
    : [
        ...nextModes,
        {
          value: 'relative-path',
          icon: RelativePathModeIcon,
          label: 'Relative Path',
          description: 'Reference files managed by the runtime',
        },
      ];

  const nextState = {
    ...stately,
    modes,
    component:
      stately.mode === 'relative-path'
        ? (
            <RelativePathEdit
              formId={props.formId}
              value={props.value}
              onChange={props.onChange}
              placeholder={props.placeholder}
            />
          )
        : stately.component,
  };

  return { ...props, stately: nextState };
};

export interface FilesUiPluginOptions {
  operationIds?: Partial<FilesApiOperationIds>;
}

export function createFilesUiPlugin(options?: FilesUiPluginOptions): StatelyUiPlugin<any, any, { files: { operationIds: FilesApiOperationIds } }> {
  const operationIds: FilesApiOperationIds = {
    list: options?.operationIds?.list ?? 'list',
    save: options?.operationIds?.save ?? 'save',
    upload: options?.operationIds?.upload ?? 'upload',
  };

  return {
    components: {
      [`${FilesNodeType.RelativePath}:edit`]: RelativePathEdit as any,
      [`${FilesNodeType.RelativePath}:view`]: RelativePathView as any,
      'primitive:edit:string': primitiveStringTransformer as any,
    },
    extensions: { files: { operationIds } },
  };
}

export const filesUiPlugin = createFilesUiPlugin();

export default filesUiPlugin;
