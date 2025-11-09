import { Save, X } from 'lucide-react';
import { useCallback, useId, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Note } from '../base/note';
import { Button } from '../ui/button';
import { Editor } from '../views/editor';

type JsonStatus = { valid: boolean; error?: string; msg?: string };

interface JsonEditViewProps {
  value: any;
  label?: string;
  onSave: (value: any) => void;
}

/**
 * Component for editing entity configuration as raw JSON
 */
export function JsonEdit({ value, onSave, label = 'Configuration (JSON)' }: JsonEditViewProps) {
  const formId = useId();
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [json, setJson] = useState<string>(JSON.stringify(value || {}, null, 2));

  const handleJsonForm = useCallback((val: string) => {
    setJson(val);
    try {
      JSON.parse(val);
      setIsDirty(true);
    } catch (error) {
      console.error('Invalid JSON syntax', error);
    }
  }, []);

  const status: JsonStatus = useMemo(() => {
    if (!json) {
      return { valid: false, msg: 'Enter valid JSON' };
    }

    try {
      JSON.parse(json);
      return { valid: true, msg: 'Valid JSON' };
    } catch (error) {
      const msg = 'Invalid JSON syntax';
      const errMsg = error
        ? typeof error === 'object' && 'message' in error
          ? error.message
          : error
        : '';
      return { valid: false, msg: `${msg}: ${errMsg}` };
    }
  }, [json]);

  return (
    <div className="space-y-4 p-3">
      <Note mode={status.valid ? 'success' : 'error'} message={status.error || status.msg || ''} />

      <div className="space-y-2">
        <Label htmlFor="config-json">{label}</Label>
        <Editor
          formId={formId}
          content={json}
          onContent={handleJsonForm}
          placeholder="Enter JSON configuration here"
          supportedLanguages={['json']}
        />
      </div>

      {/* Save/Cancel buttons appear when dirty */}
      <Button
        variant="secondary"
        onClick={() => {
          setIsDirty(false);
          onSave(json);
        }}
        disabled={!status.valid || !isDirty}
        size="sm"
        className={cn(
          'cursor-pointer',
          isDirty && status.valid && 'animate-[save-glow_2s_ease-in-out_infinite]',
        )}
      >
        <Save className="w-4 h-4 mr-2" />
        Submit
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setJson(JSON.stringify(value ?? {}));
          setIsDirty(false);
        }}
        className="cursor-pointer"
      >
        <X className="w-4 h-4 mr-2" />
        Cancel
      </Button>
    </div>
  );
}
