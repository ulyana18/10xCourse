import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { CreateFlashcardCommand } from "@/types";
import { toast } from "sonner";

const formSchema = z.object({
  front: z.string()
    .min(1, "Front side is required")
    .max(200, "Front side cannot exceed 200 characters"),
  back: z.string()
    .min(1, "Back side is required")
    .max(500, "Back side cannot exceed 500 characters")
});

const AUTOSAVE_DELAY = 2000; // 2 seconds
const STORAGE_KEY = "flashcard-form-draft";

type FormData = z.infer<typeof formSchema>;

interface UseFlashcardFormReturn {
  form: ReturnType<typeof useForm<FormData>>;
  isSubmitting: boolean;
  handleSubmit: (data: FormData) => Promise<void>;
  handleCancel: () => void;
  isDirty: boolean;
  resetForm: () => void;
}

export function useFlashcardForm(): UseFlashcardFormReturn {
  const autosaveTimerRef = useRef<number | undefined>(undefined);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      front: "",
      back: ""
    }
  });

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const data = JSON.parse(savedDraft);
        form.reset(data);
        toast.info("Draft loaded");
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, []);

  // Autosave on form changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = window.setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        toast.success("Draft saved", { duration: 1000 });
      }, AUTOSAVE_DELAY);
    });

    return () => {
      subscription.unsubscribe();
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [form.watch]);

  const resetForm = () => {
    form.reset({
      front: "",
      back: ""
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/flashcards/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message || "Failed to create flashcard"
        );
      }

      localStorage.removeItem(STORAGE_KEY);
      toast.success("Flashcard created successfully! Create another one?", {
        action: {
          label: "Reset Form",
          onClick: resetForm
        },
        duration: 5000,
      });
      resetForm();

    } catch (error) {
      console.error("Error creating flashcard:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create flashcard", {
        action: {
          label: "Retry",
          onClick: () => form.handleSubmit(handleSubmit)()
        },
        duration: 5000,
      });
    }
  };

  const handleCancel = () => {
    if (form.formState.isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to clear the form?")) {
        resetForm();
      }
    } else {
      resetForm();
    }
  };

  return {
    form,
    isSubmitting: form.formState.isSubmitting,
    handleSubmit,
    handleCancel,
    isDirty: form.formState.isDirty,
    resetForm
  };
} 