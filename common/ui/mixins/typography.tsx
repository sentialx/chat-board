import { RuleSet, css } from "styled-components";

export const FONT_REGULAR_WEIGHT = 400;
export const FONT_MEDIUM_WEIGHT = 500;
export const FONT_BOLD_WEIGHT = 600;
export const FONT_EXTRA_BOLD_WEIGHT = 700;
export const FONT_BLACK_WEIGHT = 800;

export const getLetterSpacing = (fontSize: number, tracking: number) =>
  tracking / fontSize;

export const fontRule = (name: string, weight: number) => css`
  font-family: ${name}, sans-serif;
  font-weight: ${weight};
`;

export const maxLines = (count: number) => css`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: ${count};
  -webkit-box-orient: vertical;
`;

export const singleLine = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const clearSingleLine = css`
  white-space: unset;
  overflow: unset;
  text-overflow: unset;
`;

export const regularFont = css`
  font-weight: ${FONT_REGULAR_WEIGHT};
`;

export const mediumFont = css`
  font-weight: ${FONT_MEDIUM_WEIGHT};
`;

export const boldFont = css`
  font-weight: ${FONT_BOLD_WEIGHT};
`;

export const extraBoldFont = css`
  font-weight: ${FONT_EXTRA_BOLD_WEIGHT};
`;

export const blackFont = css`
  font-weight: ${FONT_BLACK_WEIGHT};
`;

export const FONT_WEIGHTS = {
  regular: FONT_REGULAR_WEIGHT,
  medium: FONT_MEDIUM_WEIGHT,
  bold: FONT_BOLD_WEIGHT,
  extraBold: FONT_EXTRA_BOLD_WEIGHT,
  black: FONT_BLACK_WEIGHT,
} as const;

export const createFontMixins = <
  T extends Record<string, number> = typeof FONT_WEIGHTS,
>(
  fontFamily: string,
  weights?: T,
): Record<keyof T, RuleSet<object>> => {
  const map: Record<string, RuleSet<object>> = {} as any;

  for (const [name, weight] of Object.entries(weights ?? FONT_WEIGHTS)) {
    map[name] = fontRule(fontFamily, weight);
  }

  return map as any;
};

export const customSelection = (foreground: string, background: string) => css`
  & ::selection {
    color: ${foreground};
    background: ${background};
  }
`;

export const upperCase = css`
  text-transform: uppercase;
`;

export const lowerCase = css`
  text-transform: lowercase;
`;
