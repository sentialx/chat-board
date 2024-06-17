import { css, styled } from "styled-components";

import { flexRow } from "~/common/ui/mixins/box";
import { COLOR_PRIMARY } from "../../../constants/colors";

export const StyledWorkspaceItem = styled.div`
  ${flexRow};
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  cursor: pointer;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  margin-bottom: 16px;
  font-weight: bold;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  ${({ selected }) =>
    selected &&
    css`
      background-color: transparent;
      box-shadow: 0 0 0 2px ${COLOR_PRIMARY};
      &:hover {
        background-color: transparent;
      }
    `}
`;
