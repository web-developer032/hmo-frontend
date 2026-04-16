"use client";

import { useField, type FieldHookConfig } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

type FormikInputProps = FieldHookConfig<string> & {
  label: string;
  id: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
};

export function FormikInput({
  label,
  id,
  type = "text",
  autoComplete,
  placeholder,
  ...fieldConfig
}: FormikInputProps) {
  const [field, meta] = useField(fieldConfig);
  const invalid = meta.touched && Boolean(meta.error);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[0.95rem] font-semibold text-foreground">
        {label}
      </Label>
      <Input
        {...field}
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={invalid}
        className={cn(
          invalid &&
            "border-destructive focus-visible:ring-destructive/40",
        )}
      />
      {invalid ? (
        <p className="text-sm text-destructive" role="alert">
          {meta.error}
        </p>
      ) : null}
    </div>
  );
}
