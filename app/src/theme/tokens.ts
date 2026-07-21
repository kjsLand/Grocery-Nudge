/**
 * theme/tokens.ts
 * -----------------------------------------------------------------
 * Single source of truth for design values shared across components.
 *
 * Why this file exists: TextField and LoginPanel each redefined the
 * same hex values locally (AMBER, SLATE, LINE, ...). That's fine when
 * there's one component, but the moment a second component needs the
 * same palette, you either duplicate it (and risk drift the next time
 * someone tweaks one but not the other) or import it from one place.
 * This is that one place.
 *
 * Usage:
 *   import { colors } from "@/theme/tokens";
 *   color: colors.amber
 */

export const colors = {
  // Backgrounds
  ink: "#161B1F", // page background
  panel: "#1E252B", // card/surface background

  // Text
  paper: "#EDE6D6", // primary text on dark surfaces
  slate: "#7C8894", // secondary/muted text, labels at rest
  mutedPlaceholder: "#56626C", // input placeholder text

  // Structure
  line: "#2C343B", // borders, dividers, resting input underline

  // State
  amber: "#E8A33D", // accent, focus state, primary actions
  error: "#E2694F", // error text, invalid state
} as const;

export type ColorToken = keyof typeof colors;

// --- Typography ----------------------------------------------------
// The pairing used across the login panel: a characterful display
// face used sparingly (headings), and a utility monospace face for
// labels, body copy, and UI chrome.

export const fonts = {
  display: "'Fraunces', Georgia, serif",
  body: "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} as const;

// --- Spacing ---------------------------------------------------------
// Shared scale so components don't invent their own one-off values
// for padding/margins/gaps.

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "40px",
} as const;

// --- Radii -------------------------------------------------------
export const radii = {
  sm: "2px",  // inputs, small chrome
  md: "10px", // buttons, small controls
  lg: "20px", // cards, panels
} as const;