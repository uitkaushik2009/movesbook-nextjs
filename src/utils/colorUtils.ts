/**
 * Color utility functions for automatic text contrast
 */

/**
 * Calculate the relative luminance of a color
 * Based on WCAG 2.0 formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 * 
 * @param hex - Hex color string (e.g., "#FF0000" or "FF0000")
 * @returns Luminance value between 0 (darkest) and 1 (lightest)
 */
function getRelativeLuminance(hex: string): number {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  
  // Apply sRGB gamma correction
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate relative luminance
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
}

/**
 * Get the best contrasting text color (black or white) for a given background color
 * Uses the WCAG luminance formula to determine readability
 * 
 * @param backgroundColor - Background hex color (e.g., "#FF0000" or "FF0000")
 * @returns "#FFFFFF" for dark backgrounds, "#000000" for light backgrounds
 * 
 * @example
 * getContrastTextColor("#FF0000") // Returns "#FFFFFF" (white text on red background)
 * getContrastTextColor("#FFFF00") // Returns "#000000" (black text on yellow background)
 */
export function getContrastTextColor(backgroundColor: string): string {
  if (!backgroundColor) {
    return '#000000'; // Default to black if no color provided
  }
  
  try {
    const luminance = getRelativeLuminance(backgroundColor);
    
    // WCAG recommends 0.5 as the threshold
    // Luminance > 0.5 = light background → use dark text
    // Luminance ≤ 0.5 = dark background → use light text
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  } catch (error) {
    console.error('Error calculating contrast color:', error);
    return '#000000'; // Fallback to black on error
  }
}

/**
 * Calculate the contrast ratio between two colors
 * Useful for checking WCAG compliance (minimum 4.5:1 for normal text)
 * 
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @returns Contrast ratio (1:1 to 21:1)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color combination meets WCAG AA standards
 * 
 * @param backgroundColor - Background hex color
 * @param textColor - Text hex color
 * @param isLargeText - Whether the text is large (>= 18pt or >= 14pt bold)
 * @returns true if contrast meets WCAG AA standards
 */
export function meetsWCAGStandards(
  backgroundColor: string, 
  textColor: string, 
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(backgroundColor, textColor);
  const minimumRatio = isLargeText ? 3 : 4.5;
  
  return ratio >= minimumRatio;
}

