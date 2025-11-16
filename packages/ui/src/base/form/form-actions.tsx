import { Save, X } from 'lucide-react';
import { Explain } from '../components/explain';
import { GlowingSave } from '../components/glowing-save';
import { Button } from '../ui/button';

export function FormActions({
  isDirty,
  isPending,
  isLoading,
  isDisabled,
  onSave,
  onCancel,
}: {
  isDirty?: boolean;
  isPending?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {isDirty && !isDisabled ? (
        <GlowingSave isLoading={isPending} onSave={onSave} />
      ) : (
        <Explain content={<p>No changes pending</p>}>
          <span className="inline-block">
            <Button
              className="cursor-pointer"
              disabled={isDisabled || isPending || isLoading || !isDirty}
            >
              <Save className="w-4 h-4 mr-2" />
              {isPending ? 'Saving...' : 'Save'}
            </Button>
          </span>
        </Explain>
      )}
      <Button className="cursor-pointer" disabled={isPending} onClick={onCancel} variant="outline">
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
    </div>
  );
}
