import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "./FormField";
import { useKeyboardShortcuts } from "@/components/hooks/useKeyboardShortcuts";
import { useFlashcardForm } from "./hooks/useFlashcardForm";

export function FlashcardForm() {
  const frontFieldRef = useRef<HTMLTextAreaElement>(null);
  const backFieldRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    form,
    isSubmitting,
    handleSubmit,
    handleCancel,
    resetForm
  } = useFlashcardForm();

  const focusNextField = () => {
    if (document.activeElement === frontFieldRef.current) {
      backFieldRef.current?.focus();
    } else if (document.activeElement === backFieldRef.current) {
      form.handleSubmit(handleSubmit)();
    }
  };

  useKeyboardShortcuts({
    onSave: (e) => {
      e.preventDefault();
      form.handleSubmit(handleSubmit)();
    },
    onCancel: () => handleCancel(),
    onNext: () => focusNextField(),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          name="front"
          label="Front Side"
          maxLength={200}
          control={form.control}
          ref={frontFieldRef}
        />
        <FormField
          name="back"
          label="Back Side"
          maxLength={500}
          control={form.control}
          ref={backFieldRef}
        />
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Clear Form
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Flashcard"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 