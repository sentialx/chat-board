import { css } from "styled-components";

import { COLOR_PRIMARY, COLOR_SECONDARY } from "../constants/colors";

import { gradientText } from "~/common/ui/mixins/gradient";

export const getLetterSpacing = (fontSize: number, tracking: number): number =>
  tracking / fontSize;

export const interRegular = css`
  font-family: var(--font-sans);
  font-weight: 400;
`;

export const interMedium = css`
  font-family: var(--font-sans);
  font-weight: 500;
`;

export const interBold = css`
  font-family: var(--font-sans);
  font-weight: 600;
`;

export const interExtraBold = css`
  font-family: var(--font-sans);
  font-weight: 700;
`;

export const interBlack = css`
  font-family: var(--font-sans);
  font-weight: 800;
`;

export const maxLines = (count: number): any => css`
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

export const themedGradientText = css`
  background-image: linear-gradient(
    90deg,
    ${COLOR_PRIMARY} 8%,
    ${COLOR_SECONDARY} 72%
  );
  ${gradientText};
`;
