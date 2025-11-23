import type { PrimitiveStringEditTransformerProps } from '@stately/ui/core/components/fields/edit';
import { Upload } from 'lucide-react';
import { RelativePathEdit } from './relative-path-field';

export const UploadMode = {
  description: 'Browse/upload files',
  icon: Upload,
  label: 'Upload',
  placeholder: '',
  value: 'upload' as const,
};

export const UploadModeGroup = { modes: [UploadMode], name: 'File Management' };

export const primitiveStringTransformer = (props: PrimitiveStringEditTransformerProps) => ({
  ...props,
  extra: {
    ...props.extra,
    component: props.extra?.mode === 'upload' ? RelativePathEdit : null,
    modeGroups: [UploadModeGroup],
  },
});
