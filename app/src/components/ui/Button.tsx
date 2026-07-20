import { ButtonHTMLAttributes, forwardRef, useState } from "react";
import { colors } from "../../theme/tokens";

/**
 * Button - A generic, reusable button.
 * Mirrors TextField's styling approach: inline styles driven by theme tokens,
 * with focus/hover state tracked in local state.
 */

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  /** Optional element rendered before the label (e.g. an icon) */
  startAdornment?: React.ReactNode;
  /** Optional element rendered after the label (e.g. an icon) */
  endAdornment?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      loading = false,
      disabled,
      children,
      startAdornment,
      endAdornment,
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,
      style,
      ...rest
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const isDisabled = disabled || loading;
    const active = (focused || hovered) && !isDisabled;

    const variantStyles: Record<
      NonNullable<ButtonProps["variant"]>,
      { base: React.CSSProperties; active: React.CSSProperties }
    > = {
      primary: {
        base: {
          background: colors.amber,
          color: colors.paper,
          border: `1px solid ${colors.amber}`,
        },
        active: {
          background: colors.paper,
          color: colors.amber,
        },
      },
      secondary: {
        base: {
          background: "transparent",
          color: colors.paper,
          border: `1px solid ${colors.line}`,
        },
        active: {
          borderColor: colors.amber,
          color: colors.amber,
        },
      },
      ghost: {
        base: {
          background: "transparent",
          color: colors.slate,
          border: "1px solid transparent",
        },
        active: {
          color: colors.amber,
        },
      },
    };

    const { base, active: activeStyle } = variantStyles[variant];

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        onMouseEnter={(e) => {
          setHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setHovered(false);
          onMouseLeave?.(e);
        }}
        {...rest}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontSize: "13px",
          fontFamily: 'Special Elite',
          letterSpacing: "0.05em",
          padding: "10px 20px",
          borderRadius: "2px",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.5 : 1,
          transition: "background 150ms ease, color 150ms ease, border-color 150ms ease",
          outline: "none",
          ...base,
          ...(active ? activeStyle : {}),
          ...style,
        }}
      >
        
        {loading ? (
          <span aria-hidden="true">…</span>
        ) : (
          <>
            {startAdornment}
            {children}
            {endAdornment}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;