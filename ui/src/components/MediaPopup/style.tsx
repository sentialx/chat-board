import styled from "styled-components";

import { VAR_NAVIGATION_HEIGHT } from "../Navigation/style";

import { noScroll, noUserDrag, noUserSelect } from "~/common/ui/mixins/ux";
import { WithVisible } from "~/common/ui/types/state";

export const StyledMediaPopup = styled.div<WithVisible>`
  max-width: calc(100% - 64px);
  max-height: calc(100% - var(${VAR_NAVIGATION_HEIGHT}));
  z-index: 100;
  position: fixed;
  display: flex;
  align-items: center;
  ${noUserDrag};
  ${noUserSelect};
  ${noScroll};

  & img {
    width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;
