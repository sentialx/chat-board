import { css, styled } from "styled-components";
import { flexColumn } from "~/common/ui/mixins/box";
import { COLOR_PRIMARY } from "../../constants/colors";
import { WithSelected } from "~/common/ui/types/state";
import { centerIcon, iconSrc, invert } from "~/common/ui/mixins/image";
import { ICON_MORE } from "../../constants/icons";

export const StyledDetails = styled.div`
  min-width: 300px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.12);
  padding: 24px;
`;

export const Title = styled.div`
  font-size: 24px;
  font-weight: bold;
  position: relative;
  width: fit-content;
  margin-bottom: 24px;

  &:after {
    content: "";
    opacity: 0;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.05);
    inset: -8px -12px;
    border-radius: 8px;
  }

  &:hover:after {
    opacity: 1;
  }
`;

export const Users = styled.div`
  ${flexColumn};
  gap: 16px;
`;

export const MiniRoles = styled.div`
  display: flex;
  gap: 8px;
  margin-left: 8px;
`;

export const MiniRole = styled.div`
  font-size: 14px;
  opacity: 0.5;
`;

export const Role = styled.div<WithSelected>`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  ${({ $selected }) =>
    $selected &&
    css`
      border: 1px solid ${COLOR_PRIMARY};
    `}
`;

export const Roles = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px;
`;

export const More = styled.div`
  cursor: default;
  ${iconSrc(ICON_MORE)};
  opacity: 0;
  min-width: 16px;
  transition: opacity 0.2s;
  ${invert}
  ${centerIcon("16px")};

  &:hover {
    opacity: 1;
  }
`;

export const StyledUser = styled.div<WithSelected>`
  position: relative;
  cursor: pointer;
  display: flex;
  padding: 4px 0;

  &:after {
    content: "";
    opacity: 0;
    position: absolute;
    background-color: rgba(255, 255, 255, 0.05);
    inset: -8px -12px;
    border-radius: 6px;
    pointer-events: none;
  }

  &:before {
    content: "";
    width: 4px;
    height: 24px;
    background-color: ${COLOR_PRIMARY};
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    opacity: 0;
    position: absolute;
    left: -12px;
    top: -1px;
  }

  &:hover:after {
    opacity: 1;
  }

  &:hover {
    & ${More} {
      opacity: 0.5;
    }
  }

  ${({ $selected }) =>
    $selected &&
    css`
      &:before {
        opacity: 1;
      }

      &:hover {
        &:after {
          opacity: 0;
        }
      }

      cursor: default;
    `}
`;
