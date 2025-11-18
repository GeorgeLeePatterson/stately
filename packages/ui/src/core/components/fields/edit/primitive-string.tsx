import type { Schemas } from '@stately/schema';
import { FileText, Link as LinkIcon, Type } from 'lucide-react';
import { type ComponentType, useMemo, useState } from 'react';
import { Editor } from '@/base/components/editor';
import type { EditFieldProps } from '@/base/form/field-edit';
import { getEditTransformer, makeRegistryKey } from '@/base/registry';
import { ButtonGroup } from '@/base/ui/button-group';
import { InputGroup, InputGroupInput, InputGroupTextarea } from '@/base/ui/input-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '@/base/ui/select';
import { useStatelyUi } from '@/index';

export interface StringMode {
  description: string;
  icon: ComponentType<any>;
  label: string;
  value: string;
}

/// Core string input modes available by default
const CORE_STRING_MODES: StringMode[] = [
  { description: 'Plain text', icon: Type, label: 'Text', value: 'text' },
  { description: 'Web address', icon: LinkIcon, label: 'URL', value: 'url' },
  { description: 'Multi-line text', icon: FileText, label: 'Editor', value: 'editor' },
];

export type PrimitiveStringEditTransformerProps<Schema extends Schemas = Schemas> =
  PrimitiveStringEditProps<Schema> & { extra?: PrimitiveStringExtra };

export interface PrimitiveStringExtra {
  mode?: string;
  modes?: StringMode[];
  currentMode?: StringMode;
  component?: ComponentType<{
    formId: string;
    value: string | number | null | undefined;
    onChange: (value: string | number | null | undefined) => void;
  }>;
  after?: React.ReactNode;
}

export type PrimitiveStringEditProps<Schema extends Schemas = Schemas> = EditFieldProps<
  Schema,
  Schema['plugin']['Nodes']['primitive'],
  string | number | null | undefined
>;

export function PrimitiveStringEdit<Schema extends Schemas = Schemas>(
  props: PrimitiveStringEditProps<Schema>,
) {
  const { registry } = useStatelyUi();
  const [mode, setMode] = useState<string>('text');

  // Look up prop transformer for 'primitive::edit::string'
  const { formId, onChange, placeholder, value, extra } = useMemo(() => {
    let propsAndExtra: PrimitiveStringEditTransformerProps = {
      ...props,
      extra: { mode, modes: CORE_STRING_MODES },
    };

    const propTransformer = getEditTransformer<
      PrimitiveStringExtra,
      Schema,
      Schema['plugin']['Nodes']['primitive'],
      string | number | null | undefined
    >(registry.transformers, makeRegistryKey('primitive', 'edit', 'transformer', 'string'));

    if (typeof propTransformer === 'function') {
      try {
        const transformed = propTransformer(propsAndExtra);
        if (transformed) propsAndExtra = transformed;
      } catch (e) {
        console.warn('PrimitiveStringField prop transformer failed:', e);
      }
    }

    return propsAndExtra;
  }, [props, mode, registry.transformers]);

  // Extract final state
  const ExtraComponent = extra?.component;
  const currentMode = extra?.mode ?? mode;
  const allModes = [
    ...CORE_STRING_MODES,
    ...(extra?.modes ?? []).filter(m => !CORE_STRING_MODES.includes(m)),
  ];
  const currentModeConfig = allModes.find(m => m.value === currentMode);
  const Icon = currentModeConfig?.icon ?? Type;

  return (
    <ButtonGroup className="flex-1 min-w-0 w-full">
      {/* Mode selector dropdown */}
      <ButtonGroup>
        <Select onValueChange={v => setMode(v)} value={currentMode}>
          <SelectTrigger className="w-auto min-w-12 gap-1.5 bg-background" id={`select-${formId}`}>
            <Icon />
          </SelectTrigger>
          <SelectContent className="min-w-40">
            <SelectGroup>
              <SelectLabel>Text Entry</SelectLabel>
              {allModes.map(modeConfig => {
                const ModeIcon = modeConfig.icon;
                return (
                  <SelectItem key={modeConfig.value} value={modeConfig.value}>
                    <div className="flex items-center gap-2">
                      <ModeIcon />
                      <span>{modeConfig.label}</span>
                      <span className="text-muted-foreground text-xs">
                        • {modeConfig.description}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
            {extra?.after}
          </SelectContent>
        </Select>
      </ButtonGroup>

      <ButtonGroup className="flex-1 min-h-min">
        {/* Custom component takes precedence */}
        {ExtraComponent ? (
          <ExtraComponent formId={formId} onChange={onChange} value={value} />
        ) : (
          <>
            {currentMode === 'editor' && (
              <Editor
                content={value ? (typeof value === 'string' ? value : String(value)) : ''}
                formId={formId}
                onContent={onChange}
                placeholder={placeholder || 'Type or paste content here...'}
              />
            )}

            <InputGroup className="flex-1 min-h-min bg-background">
              {currentMode === 'text' && (
                <InputGroupTextarea
                  className="min-w-0 flex-1 bg-background resize-y max-h-64 min-h-1 px-3 py-1"
                  id={formId}
                  onChange={e => onChange(e.target.value)}
                  placeholder={`${placeholder || 'Enter value'}...`}
                  rows={1}
                  value={value || ''}
                />
              )}

              {currentMode === 'url' && (
                <InputGroupInput
                  className="bg-background rounded-md"
                  id={formId}
                  onChange={e => onChange(e.target.value)}
                  placeholder={`${placeholder || 'https://example.com'}...`}
                  type="url"
                  value={value || ''}
                />
              )}
            </InputGroup>
          </>
        )}
      </ButtonGroup>
    </ButtonGroup>
  );
}
