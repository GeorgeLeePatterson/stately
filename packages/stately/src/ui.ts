/**
 * Stately's UI module simply re-exports the most used pieces of @statelyjs/ui.
 *
 * If building a project that requires more customization, these re-exports may not be sufficient,
 * and in that case, @statelyjs/ui should be installed and imported directly.
 */

/**
 * Re-export Dialog related components and types from @statelyjs/ui
 */
import { ConfirmDialog } from '@statelyjs/ui/dialogs';

export type { ConfirmDialogProps } from '@statelyjs/ui/dialogs';
export { ConfirmDialog };

/**
 * Re-export Hooks related components and types from @statelyjs/ui
 */
import { STORAGE_KEY, useClickTracking, useMediaQuery, useViewMore } from '@statelyjs/ui/hooks';

export type { ClickTrack } from '@statelyjs/ui/hooks';
export { STORAGE_KEY, useClickTracking, useMediaQuery, useViewMore };

/**
 * Re-export Theme related components and types from @statelyjs/ui
 */
import { ThemeProvider, ThemeToggle, useTheme } from '@statelyjs/ui';

export type { Theme, ThemeProviderProps } from '@statelyjs/ui';
export { ThemeProvider, ThemeToggle, useTheme };
