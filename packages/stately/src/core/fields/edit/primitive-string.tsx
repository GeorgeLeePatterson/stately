import { devLog, registry as uiRegistry } from '@statelyjs/ui';
import { Editor } from '@statelyjs/ui/components';
import { ButtonGroup } from '@statelyjs/ui/components/base/button-group';
import {
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
} from '@statelyjs/ui/components/base/input-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '@statelyjs/ui/components/base/select';
import type { FieldEditProps } from '@statelyjs/ui/form';
import { FileText, Link as LinkIcon, Type } from 'lucide-react';
import { type ComponentType, useMemo, useState } from 'react';
import type { Schemas } from '@/core/schema';
import { CoreNodeType } from '@/core/schema/nodes';
import { useStatelyUi } from '@/index';

const { getEditTransformer } = uiRegistry;

export interface StringMode {
  description: string;
  icon: ComponentType<any>;
  label: string;
  value: string;
}

export interface StringModeGroup {
  name: string;
  modes: StringMode[];
}

/// Core string input modes available by default
const CORE_STRING_MODES: StringModeGroup = {
  modes: [
    { description: 'Plain text', icon: Type, label: 'Text', value: 'text' },
    { description: 'Web address', icon: LinkIcon, label: 'URL', value: 'url' },
    { description: 'Multi-line text', icon: FileText, label: 'Editor', value: 'editor' },
  ],
  name: 'Text Entry',
};

export type PrimitiveStringEditTransformerProps<Schema extends Schemas = Schemas> =
  PrimitiveStringEditProps<Schema> & { extra?: PrimitiveStringExtra };

export interface PrimitiveStringExtra {
  mode?: string;
  modeGroups?: StringModeGroup[];
  component?: ComponentType<{
    formId: string;
    value: string | number | null | undefined;
    onChange: (value: string | number | null | undefined) => void;
  }>;
}

export type PrimitiveStringEditProps<Schema extends Schemas = Schemas> = FieldEditProps<
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
      extra: { mode, modeGroups: [CORE_STRING_MODES] },
    };

    const propTransformer = getEditTransformer<
      PrimitiveStringExtra,
      Schema,
      Schema['plugin']['Nodes']['primitive'],
      string | number | null | undefined
    >(registry.transformers, CoreNodeType.Primitive, 'string');

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
  const modeGroups = [CORE_STRING_MODES, ...(extra?.modeGroups || [])];
  const allModes = [
    ...CORE_STRING_MODES.modes,
    ...(extra?.modeGroups?.flatMap(group => group.modes) || []),
  ];
  const currentModeConfig = allModes.find(m => m.value === currentMode);
  const Icon = currentModeConfig?.icon ?? Type;

  devLog.debug('Core', 'PrimitiveString resolved: ', {
    currentMode,
    ExtraComponent,
    extra,
    mode,
    props,
    value,
  });

  return (
    <ButtonGroup className="flex-1 min-w-0 w-full">
      {/* Mode selector dropdown */}
      <ButtonGroup>
        <Select onValueChange={v => v && setMode(v)} value={currentMode}>
          <SelectTrigger className="w-auto min-w-12 gap-1.5 bg-background" id={`select-${formId}`}>
            <Icon />
          </SelectTrigger>
          <SelectContent className="min-w-40">
            {/* Mode groups */}
            {modeGroups.map(({ name, modes }) => (
              <SelectGroup key={`select-mode-group-${name}`}>
                <SelectLabel>{name}</SelectLabel>
                {modes.map(modeConfig => {
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
            ))}
          </SelectContent>
        </Select>
      </ButtonGroup>

      {/* Custom component takes precedence */}
      {ExtraComponent ? (
        <ExtraComponent formId={formId} onChange={onChange} value={value} />
      ) : currentMode === 'editor' ? (
        <Editor
          content={value ? (typeof value === 'string' ? value : String(value)) : ''}
          formId={formId}
          onContent={onChange}
          placeholder={placeholder || 'Type or paste content here...'}
        />
      ) : (
        <ButtonGroup className="flex-1 min-h-min">
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
        </ButtonGroup>
      )}
    </ButtonGroup>
  );
}
