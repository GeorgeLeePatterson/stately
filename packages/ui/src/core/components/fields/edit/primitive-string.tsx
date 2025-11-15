import type { CorePrimitiveNode } from "@/core";
import { FileText, Link as LinkIcon, Type } from "lucide-react";
import { useState } from "react";
import { useStatelyUi } from "@/context";
import { ButtonGroup } from "@/core/components/ui/button-group";
import {
  InputGroup,
  InputGroupInput,
  InputGroupTextarea,
} from "@/core/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/core/components/ui/select";
import type { EditFieldProps } from "@/base/form/field-edit";
import { Editor } from "@/base/components/editor";
import { Schemas } from "@stately/schema";

/// Core string input modes available by default
const CORE_STRING_MODES = [
  { value: "text", icon: Type, label: "Text", description: "Plain text" },
  { value: "url", icon: LinkIcon, label: "URL", description: "Web address" },
  {
    value: "editor",
    icon: FileText,
    label: "Editor",
    description: "Multi-line text",
  },
];

export type PrimitiveStringEditProps<Schema extends Schemas = Schemas> =
  EditFieldProps<
    Schema,
    CorePrimitiveNode,
    string | number | null | undefined
  >;

/**
 * PrimitiveStringField - Extensible string field component
 *
 * EXTENSION POINT DOCUMENTATION:
 * ================================
 * This component looks up `registry.transformers.get('primitive::edit::string')` for a prop transformer.
 *
 * The transformer receives (props + stately) and must return (props + stately).
 *
 * stately shape:
 *   - mode: current active mode (string)
 *   - setMode: function to change mode
 *   - modes: array of mode config objects to display in dropdown
 *   - component: optional React.ReactNode to render instead of default for current mode
 *   - after: optional React.ReactNode to append after core modes in dropdown
 *
 * Example usage (from @stately/files plugin):
 * ```typescript
 * registry.transformers.set('primitive::edit::string', (props) => ({
 *   ...props,
 *   stately: {
 *     ...props.stately,
 *     modes: [...props.stately.modes, {
 *       value: 'upload',
 *       icon: Upload,
 *       label: 'Upload',
 *       description: 'Browse/upload files'
 *     }],
 *     component: props.stately.mode === 'upload'
 *       ? <RelativePathField {...props} />
 *       : props.stately.component,
 *   }
 * }));
 * ```
 */
export function PrimitiveStringEdit<Schema extends Schemas = Schemas>({
  formId,
  node,
  value,
  onChange,
  placeholder,
}: PrimitiveStringEditProps<Schema>) {
  const { registry } = useStatelyUi();
  const [mode, setMode] = useState<string>("text");

  // Initial props + state
  let propsAndState = {
    formId,
    node,
    value,
    onChange,
    placeholder,
    stately: {
      mode,
      setMode,
      modes: [] as typeof CORE_STRING_MODES,
      component: null as React.ReactNode | null,
      after: null as React.ReactNode | null,
    },
  };

  // Look up prop transformer for 'primitive::edit::string'
  const propTransformer = registry.transformers.get("primitive::edit::string");
  if (typeof propTransformer === "function") {
    try {
      const transformed = propTransformer(propsAndState);
      if (transformed) propsAndState = transformed;
    } catch (e) {
      console.warn("PrimitiveStringField prop transformer failed:", e);
    }
  }

  // Extract final state
  const { stately } = propsAndState;
  const currentMode = stately?.mode ?? mode;
  const allModes = [...CORE_STRING_MODES, ...(stately?.modes ?? [])];
  const customComponent = stately?.component;
  const afterDropdown = stately?.after;

  const currentModeConfig = allModes.find((m) => m.value === currentMode);
  const Icon = currentModeConfig?.icon ?? Type;

  return (
    <ButtonGroup className="flex-1 min-w-0 w-full">
      {/* Mode selector dropdown */}
      <ButtonGroup>
        <Select value={currentMode} onValueChange={(v) => setMode(v)}>
          <SelectTrigger
            id={`select-${formId}`}
            className="w-auto min-w-12 gap-1.5 bg-background"
          >
            <Icon />
          </SelectTrigger>
          <SelectContent className="min-w-40">
            <SelectGroup>
              <SelectLabel>Text Entry</SelectLabel>
              {allModes.map((modeConfig) => {
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
            {afterDropdown}
          </SelectContent>
        </Select>
      </ButtonGroup>

      <ButtonGroup className="flex-1 min-h-min">
        {/* Custom component takes precedence */}
        {customComponent ? (
          customComponent
        ) : (
          <>
            {currentMode === "editor" && (
              <Editor
                formId={formId}
                content={
                  value
                    ? typeof value === "string"
                      ? value
                      : String(value)
                    : ""
                }
                onContent={onChange}
                placeholder={placeholder || "Type or paste content here..."}
              />
            )}

            {currentMode === "text" && (
              <InputGroup className="flex-1 min-h-min bg-background">
                <InputGroupTextarea
                  id={formId}
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={`${placeholder || "Enter value"}...`}
                  className="min-w-0 flex-1 bg-background resize-y max-h-64 min-h-1 px-3 py-1"
                  rows={1}
                />
              </InputGroup>
            )}

            {currentMode === "url" && (
              <InputGroup className="flex-1 min-h-min bg-background">
                <InputGroupInput
                  id={formId}
                  type="url"
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={`${placeholder || "https://example.com"}...`}
                  className="bg-background rounded-md"
                />
              </InputGroup>
            )}
          </>
        )}
      </ButtonGroup>
    </ButtonGroup>
  );
}
