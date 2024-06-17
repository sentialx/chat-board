import styled, { css } from "styled-components";

import { noUserDrag, noUserSelect } from "../../mixins/ux";
import { WithDraggable, WithLoaded } from "../../types/state";

export const ImageContainer = styled.div<WithDraggable & { $fill?: boolean }>`
  position: relative;
  overflow: hidden;

  ${({ $draggable }) =>
    !$draggable &&
    css`
      ${noUserSelect};
      ${noUserDrag};
    `}

  ${({ $fill }) =>
    $fill &&
    css`
      width: 100%;
      height: 100%;
    `}
`;

export const StyledImage = styled.img<WithLoaded & WithDraggable>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  visibility: hidden;
  opacity: 0;

  ${({ $loaded }) =>
    $loaded &&
    css`
      visibility: visible;
      opacity: 1;
    `}

  ${({ $draggable }) =>
    !$draggable &&
    css`
      ${noUserSelect};
    `}
`;
