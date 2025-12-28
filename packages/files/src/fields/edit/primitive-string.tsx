import type {
  StringEditState,
  StringModeGroup,
} from '@statelyjs/stately/core/extensions/add-string-modes';
import { Upload } from 'lucide-react';
import { RelativePathEdit } from './relative-path-field';

/**
 * Upload mode configuration for the string field mode selector.
 */
export const UploadMode = {
  description: 'Browse/upload files',
  icon: Upload,
  label: 'Upload',
  value: 'upload' as const,
};

/**
 * Mode group containing file management modes.
 */
export const UploadModeGroup: StringModeGroup = { modes: [UploadMode], name: 'File Management' };

/**
 * Extension transformer that adds file upload mode to string fields.
 *
 * Uses the new partial return - no need to spread state.
 */
export const filesStringExtension = (state: StringEditState): Partial<StringEditState> => ({
  component: state.modeState.mode === 'upload' ? RelativePathEdit : state.component,
  modeState: {
    mode: state.modeState.mode,
    modeGroups: [...(state.modeState.modeGroups ?? []), UploadModeGroup],
  },
});
