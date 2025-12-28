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
import { BaseEditor } from '@statelyjs/ui/components/editor';
import type { FieldEditProps } from '@statelyjs/ui/registry';
import { useMemo, useState } from 'react';
import {
  CORE_STRING_MODES,
  type StringModeGroup,
  useStringModes,
} from '@/core/extensions/add-string-modes';
import type { Schemas } from '@/core/schema';
import { log } from '@/utils';

export type PrimitiveStringEditProps<Schema extends Schemas = Schemas> = FieldEditProps<
  Schema,
  Schema['plugin']['Nodes']['primitive'],
  string | number | null | undefined
>;

/**
 * String primitive edit component with extensible input modes.
 *
 * Plugins can add custom modes via the `stringModes` extension point.
 *
 * @see {@link useStringModes} for extension documentation
 */
export function PrimitiveStringEdit<Schema extends Schemas = Schemas>(
  props: PrimitiveStringEditProps<Schema>,
) {
  const { formId, onChange, placeholder, value } = props;
  const [mode, setMode] = useState<string>('text');

  // Memoize options to prevent unnecessary re-renders
  const options = useMemo(
    () => ({ formId, mode, onChange, placeholder, value }),
    [formId, value, onChange, placeholder, mode],
  );

  // Use the extensible hook - handles initial state and transformations
  const {
    component: ModeComponent,
    modeState: { mode: currentMode, modeGroups },
  } = useStringModes(options);

  // Flatten all modes for lookup
  const currentModeConfig =
    modeGroups.flatMap(group => group.modes).find(m => m.value === currentMode) ??
    CORE_STRING_MODES.modes[0];
  const Icon = currentModeConfig?.icon;

  log.debug('Core', 'PrimitiveString resolved:', {
    currentMode,
    hasComponent: !!ModeComponent,
    modeGroups: modeGroups.map(g => g.name),
  });

  return (
    <ButtonGroup className="flex-1 min-w-0 w-full">
      {/* Mode selector dropdown */}
      <ButtonGroup>
        <Select onValueChange={v => v && setMode(v)} value={currentMode}>
          <SelectTrigger className="w-auto min-w-12 gap-1.5 bg-background" id={`select-${formId}`}>
            {Icon && <Icon />}
          </SelectTrigger>
          <SelectContent className="min-w-40">
            {modeGroups.map(({ name, modes }: StringModeGroup) => (
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
      {ModeComponent ? (
        <ModeComponent
          formId={formId}
          onChange={onChange}
          placeholder={placeholder}
          value={value}
        />
      ) : currentMode === 'multiline' ? (
        <BaseEditor
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
