import { forwardRef, useEffect, useState } from "react";
import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  name: string;
  label: string;
  maxLength: number;
  control: Control<any>;
}

export const FormField = forwardRef<HTMLTextAreaElement, FormFieldProps>(
  ({ name, label, maxLength, control }, ref) => {
    const [charCount, setCharCount] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isFocused, setIsFocused] = useState(false);

    return (
      <ShadcnFormField
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <FormItem className="w-full">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="w-full space-y-2">
                <Textarea
                  value={field.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCharCount(value.length);
                    setProgress((value.length / maxLength) * 100);
                    field.onChange(value);
                  }}
                  onBlur={(e) => {
                    setIsFocused(false);
                    field.onBlur();
                  }}
                  onFocus={() => setIsFocused(true)}
                  ref={ref}
                  className={cn(
                    "w-full min-h-[200px] max-h-[200px] resize-none break-all whitespace-pre-wrap",
                    isFocused && "ring-2 ring-primary ring-offset-2",
                    fieldState.error && "ring-2 ring-destructive"
                  )}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={`${name}-description ${name}-count`}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span 
                    id={`${name}-count`}
                    className={cn(
                      "transition-colors duration-200",
                      charCount > maxLength && "text-destructive"
                    )}
                    aria-live="polite"
                  >
                    {charCount}/{maxLength} characters
                  </span>
                  <Progress 
                    value={progress} 
                    className={cn(
                      "w-1/3 transition-colors duration-200",
                      progress > 100 && "bg-destructive"
                    )}
                    aria-label={`${label} completion`}
                  />
                </div>
              </div>
            </FormControl>
            <FormMessage id={`${name}-description`} />
          </FormItem>
        )}
      />
    );
  }
); 