/**
 * Get the color for gain/loss values.
 * Positive values return success color, negative values return error color,
 * and null/undefined/zero values return inherit.
 *
 * @param value - The numeric value to determine color for
 * @returns MUI color string ('success.main', 'error.main', or 'inherit')
 */
export function getGainLossColor(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'inherit';
  }
  if (value > 0) {
    return 'success.main';
  }
  if (value < 0) {
    return 'error.main';
  }
  return 'inherit';
}

/**
 * Get the color for action values (Buy/Sell).
 * Buy actions return success color, Sell actions return error color,
 * and other values return inherit.
 *
 * @param action - The action string (e.g., "Buy", "Sell")
 * @returns MUI color string ('success.main', 'error.main', or 'inherit')
 */
export function getActionColor(action: string): string {
  if (action === 'Buy') {
    return 'success.main';
  }
  if (action === 'Sell') {
    return 'error.main';
  }
  return 'inherit';
}

