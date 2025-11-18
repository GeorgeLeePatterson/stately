import { SelectGroup, SelectItem, SelectLabel } from '@stately/ui/base/ui';
import type {
  PrimitiveStringEditTransformerProps,
  StringMode,
} from '@stately/ui/core/components/fields/edit';
import { Upload } from 'lucide-react';
import { RelativePathEdit } from './relative-path-field';

export const primitiveStringTransformer = (props: PrimitiveStringEditTransformerProps) => ({
  ...props,
  extra: {
    ...props.extra,
    after: props.extra?.mode === 'upload' ? PrimitiveStringUpload : null,
    components: props.extra?.mode === 'upload' ? RelativePathEdit : null,
    modes: [
      {
        description: 'Browse/upload files',
        icon: Upload,
        label: 'Upload',
        placeholder: '',
        value: 'upload' as const,
      },
    ],
  },
});

export function PrimitiveStringUpload({ modes }: { modes: StringMode[] }) {
  return (
    modes.some(m => m.value === 'upload') && (
      <SelectGroup>
        <SelectLabel>File Management</SelectLabel>
        {modes
          .filter(m => m.value === 'upload')
          .map(mode => {
            const ModeIcon = mode.icon;
            return (
              <SelectItem key={mode.value} value={mode.value}>
                <div className="flex items-center gap-2">
                  <ModeIcon />
                  <span>{mode.label}</span>
                  <span className="text-muted-foreground text-xs">• {mode.description}</span>
                </div>
              </SelectItem>
            );
          })}
      </SelectGroup>
    )
  );
}
