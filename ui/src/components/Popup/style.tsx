import styled, { css } from "styled-components";

import {
  hidden,
  noUserDrag,
  noUserSelect,
  visible,
} from "~/common/ui/mixins/ux";
import { WithVisible } from "~/common/ui/types/state";

export const StyledPopup = styled.div<WithVisible>`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  ${noUserSelect};
  ${hidden};
  padding: 16px;
  transition: 0.2s opacity;

  ${({ $visible: isVisible }) =>
    isVisible &&
    css`
      ${visible};
    `}
`;

export const PopupBackground = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  background-color: rgba(0, 0, 0, 0.7);
  /* backdrop-filter: blur(24px); */
  ${noUserSelect};
  ${noUserDrag};
  
`;
