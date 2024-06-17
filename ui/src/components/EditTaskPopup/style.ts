import styled from "styled-components";

import { noScroll, noUserDrag, noUserSelect } from "~/common/ui/mixins/ux";
import { WithVisible } from "~/common/ui/types/state";

export const StyledEditTaskPopup = styled.div<WithVisible>`
  max-width: calc(100% - 64px);
  max-height: calc(100% - 64px);
  z-index: 100;
  position: fixed;
  align-items: center;
  ${noUserDrag};
  ${noUserSelect};
  background-color: #212121;
  border-radius: 16px;
  padding: 32px;

  & img {
    width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;
