"use client";

type TextFieldProps = {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
};

export function TextField({
  id,
  label,
  type = "text",
  autoComplete,
  value,
  onChange,
  required,
}: TextFieldProps) {
  return (
    <div className="stack" style={{ gap: "0.25rem" }}>
      <label htmlFor={id} style={{ fontWeight: 600, fontSize: "0.875rem" }}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        type={type}
        autoComplete={autoComplete}
        value={value}
        required={required}
        onChange={(ev) => onChange(ev.target.value)}
      />
    </div>
  );
}
