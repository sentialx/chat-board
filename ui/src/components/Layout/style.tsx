import styled, { css } from "styled-components";

import { flexColumn, flexRow } from "~/common/ui/mixins/box";

export interface LayoutProps {
  noScroll?: boolean;
}

export const StyledLayout = styled.div<LayoutProps>`
  width: 100%;
  height: 100dvh;
  background-color: #212121;
  position: relative;
  overflow-x: hidden;
  overscroll-behavior: none;
  ${flexRow};

  ${({ noScroll }) =>
    noScroll &&
    css`
      overflow: hidden;
    `}
`;
