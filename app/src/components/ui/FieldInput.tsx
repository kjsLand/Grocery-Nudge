import { useState, InputHTMLAttributes, forwardRef } from "react";
import { colors } from "../../theme/tokens";

/**
 * TextField - A generic, reusable text input.
 */

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  /** Optional element rendered to the right of the label (e.g. a "Forgot?" link) */
  labelAction?: React.ReactNode;
  /** Optional element rendered inside the field on the right (e.g. a show/hide toggle) */
  endAdornment?: React.ReactNode;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      value,
      onChange,
      error,
      labelAction,
      endAdornment,
      id,
      name,
      type = "text",
      ...rest
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const inputId =
      id ?? `field-${(name ?? label).toLowerCase().replace(/\s+/g, "-")}`;
    const borderColor = error ? colors.error : focused ? colors.amber : colors.line;
    const labelColor = error ? colors.error : focused ? colors.amber : colors.slate;
    const isControlled = value !== undefined;

    return (
      <div style={{ marginBottom: "2px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <label
            htmlFor={inputId}
            style={{
              display: "block",
              fontSize: "11px",
              letterSpacing: "0.1em",
              color: labelColor,
              marginBottom: "8px",
              transition: "color 150ms ease",
            }}
          >
            {label.toUpperCase()}
          </label>
          {labelAction}
        </div>

        <div style={{ position: "relative" }}>
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            {...(isControlled
              ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value) }
              : {})}
            onFocus={(e) => {
              setFocused(true);
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              rest.onBlur?.(e);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...rest}
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "transparent",
              border: "none",
              borderBottom: `1px solid ${borderColor}`,
              color: colors.ink,
              fontSize: "14px",
              fontFamily: "Special Elite",
              padding: endAdornment ? "8px 28px 8px 2px" : "8px 2px",
              transition: "border-color 150ms ease",
              outline: "none",
            }}
          />
          {endAdornment && (
            <div
              style={{
                position: "absolute",
                right: "2px",
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
              }}
            >
              {endAdornment}
            </div>
          )}
        </div>

        <div style={{ minHeight: "18px", marginTop: "4px" }}>
          {error && (
            <p
              id={`${inputId}-error`}
              style={{ color: colors.error, fontSize: "12px", margin: 0 }}
            >
              {error}
            </p>
          )}
        </div>

        <style>{`
          #${inputId}::placeholder { color: ${colors.mutedPlaceholder}; }
        `}</style>
      </div>
    );
  }
);

TextField.displayName = "TextField";

export default TextField;