import { Save, X } from 'lucide-react';
import { type ComponentProps, useMemo } from 'react';
import { Button } from './base/button';
import { Field } from './base/field';
import { Explain } from './explain';

const Wrapper = ({
  children,
  mode = 'view',
}: {
  mode?: 'view' | 'edit';
  children: React.ReactNode;
}) =>
  mode === 'view' ? (
    <div className="flex justify-start gap-2">{children}</div>
  ) : (
    <Field orientation="horizontal">{children}</Field>
  );

const createLabel = (label?: string, loading?: boolean) => {
  const maybeLabel = label ? ` ${label}` : '';
  return `${loading ? `Saving${maybeLabel}` : `Save${maybeLabel}`}`;
};

export function GlowingSave({
  size,
  label,
  onSave,
  onCancel,
  isDisabled,
  disabledExplain,
  isLoading,
  mode = 'view',
}: {
  size?: ComponentProps<typeof Button>['size'];
  label?: string;
  onSave: () => void;
  onCancel?: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  disabledExplain?: string;
  mode?: 'view' | 'edit';
}) {
  const saveButton = useMemo(() => {
    return (
      <Button
        className="animate-[save-glow_2s_ease-in-out_infinite] cursor-pointer"
        disabled={isDisabled || isLoading}
        onClick={onSave}
        size={size}
        type="button"
      >
        <Save className="w-4 h-4 mr-2" />
        {createLabel(label, isLoading)}
      </Button>
    );
  }, [onSave, isDisabled, isLoading, size, label]);

  // Save/Cancel buttons appear when dirty
  return (
    <Wrapper mode={mode}>
      {isDisabled && disabledExplain ? (
        <Explain content={disabledExplain}>
          <span className="inline-block">{saveButton}</span>
        </Explain>
      ) : (
        saveButton
      )}
      {onCancel && (
        <Button
          className="cursor-pointer"
          disabled={isLoading}
          onClick={onCancel}
          size={size}
          type="button"
          variant="outline"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      )}
    </Wrapper>
  );
}
