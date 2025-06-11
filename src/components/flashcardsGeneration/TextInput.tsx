import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState, type ChangeEvent } from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export function TextInput({ value, onChange, error }: TextInputProps) {
  const [touched, setTouched] = useState(false);
  const charCount = value.length;
  const isValid = charCount >= 1000 && charCount <= 10000;
  const remainingChars = 10000 - charCount;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor="source-text">Source Text</Label>
        <span className={`text-sm ${touched ? (isValid ? 'text-green-600' : 'text-red-600') : ''}`}>
          {charCount} / 10000 characters
          {charCount < 1000 && ` (${1000 - charCount} more needed)`}
          {charCount > 1000 && charCount <= 10000 && ` (${remainingChars} remaining)`}
          {charCount > 10000 && ` (${-remainingChars} to be removed)`}
        </span>
      </div>

      <Textarea
        id="source-text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter your text here (minimum 1000 characters, maximum 10000 characters)"
        className={`min-h-[200px] max-h-[200px] ${touched && !isValid ? 'border-red-300' : ''}`}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 