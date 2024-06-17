import { css } from "styled-components";

export const borderShadow = (color: string, thickness = "1px") => css`
  box-shadow: 0 0 0 ${thickness} ${color};
`;

export const size = (size: string) => css`
  width: ${size};
  height: ${size};
`;

export const maxSize = (size: string) => css`
  max-width: ${size};
  max-height: ${size};
`;

export const flexRow = css`
  display: flex;
  flex-direction: row;
`;

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

export const marginY = (margin: string) => css`
  margin-top: ${margin};
  margin-bottom: ${margin};
`;

export const marginX = (margin: string) => css`
  margin-left: ${margin};
  margin-right: ${margin};
`;

export const paddingY = (padding: string) => css`
  padding-top: ${padding};
  padding-bottom: ${padding};
`;

export const paddingX = (padding: string) => css`
  padding-left: ${padding};
  padding-right: ${padding};
`;

export const innerBackgroundColor = (
  color: string,
  target: "after" | "before" = "before",
) => css`
  &::${target} {
    content: "";
    display: block;
    background-color: ${color};
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
`;

export const flexCenterBoth = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const borderY = (border: string) => css`
  border-top: ${border};
  border-bottom: ${border};
`;

export const borderX = (border: string) => css`
  border-left: ${border};
  border-right: ${border};
`;

export const circle = css`
  border-radius: 100%;
`;

export const rounded = css`
  border-radius: 10000px;
`;

export const innerBorderRadius = (outerRadius: string, distance: string) => css`
  border-radius: calc(${outerRadius} - ${distance});
`;

export const paddingAspectRatio = (ratio: number) => css`
  position: relative;
  overflow: hidden;
  height: 0;
  padding-top: ${(1 / ratio) * 100}%;
`;

export const aspectRatio = (ratio: number) => css`
  @supports (aspect-ratio: ${ratio}) {
    aspect-ratio: ${ratio};
  }

  @supports not (aspect-ratio: ${ratio}) {
    ${paddingAspectRatio(ratio)}
  }
`;
