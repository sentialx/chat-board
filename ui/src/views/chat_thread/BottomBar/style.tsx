import styled, { css } from "styled-components";

import { COLOR_PRIMARY } from "../../../constants/colors";
import {
  ICON_ARROW_BACK_OUTLINED,
  ICON_DIAMOND_OUTLINED,
  ICON_FACEBOOK,
  ICON_GOOGLE,
  ICON_HEART_OUTLINED,
  ICON_IMAGE_OUTLINED,
  ICON_SEND_OUTLINED,
} from "../../../constants/icons";
import { interBold, interMedium } from "../../../mixins/typography";

import { buttonStyle } from "~/common/ui/components/Button";
import { stdTransition } from "~/common/ui/mixins/animations";
import { size } from "~/common/ui/mixins/box";
import { iconSrc, centerIcon, maskColor } from "~/common/ui/mixins/image";
import { noUserSelect, noUserDrag } from "~/common/ui/mixins/ux";
import { customInput } from "~/common/ui/mixins/default_styles";

export const StyledBottomBar = styled.div`
  width: 100%;
  padding: 8px;
  position: relative;
  /* border-top: 1px solid rgba(255, 255, 255, 0.04); */
  display: flex;
  flex-direction: column;
  margin-top: auto;
`;

export const LoginPromoArrow = styled.div`
  ${iconSrc(ICON_ARROW_BACK_OUTLINED, false)};
  ${centerIcon("24px", false)};
  transform: rotate(180deg);
  ${size("24px")};
  transition: 0.1s transform;
`;

export const LoginPromo = styled.div`
  width: calc(100% - 32px);
  max-width: 400px;
  padding: 24px;
  border-radius: 16px;
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
  margin-left: 16px;
  margin-top: 4px;
  color: rgba(0, 0, 0, 0.8);
  background: linear-gradient(45deg, #f292ed 0%, #f36364 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  text-align: center;
  overflow: hidden;
  position: relative;

  &:after {
    content: "";
    display: block;
    position: absolute;
    inset: 0;
    ${size("100%")};
    background-color: rgba(255, 255, 255, 0.16);
    opacity: 0;
    transition: 0.1s opacity;
  }

  &:hover {
    & ${LoginPromoArrow} {
      transform: rotate(180deg) translateX(-4px);
    }

    &:after {
      opacity: 1;
    }
  }
`;

export const LoginPromoTitle = styled.div`
  ${interBold};
  font-size: 18px;
`;

export const Container = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  width: 100%;
`;

export const LoginButtonIcon = styled.div`
  ${size("32px")};
  ${centerIcon("24px", false)};
  /* margin-right: 12px; */
  border-radius: 50%;
  background-color: white;
`;

export const GoogleIcon = styled(LoginButtonIcon)`
  ${iconSrc(ICON_GOOGLE, false)};
`;

export const FacebookIcon = styled(LoginButtonIcon)`
  ${iconSrc(ICON_FACEBOOK, false)};
  ${centerIcon("48px", false)};
`;

export const LoginButton = styled.button`
  width: 100%;
  ${buttonStyle}
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.5);
  padding: 8px 10px;
  font-size: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  ${interBold}
  color: rgba(0, 0, 0, 0.7);
  text-align: center;

  &:hover {
    background-color: white;
  }
`;

export const Input = styled.input`
  width: 100%;
  ${customInput};
  font-size: 14px;
  border-radius: 32px;
  padding: 0px 16px;
  height: 36px;
  margin: 0px 8px;
  background-color: rgba(255, 255, 255, 0.08);
  flex: 1;
`;

export interface ActionButtonProps {
  isSend: boolean;
  disabled?: boolean;
}

export const ActionButton = styled.div<ActionButtonProps>`
  ${size("42px")};
  flex-shrink: 0;
  transition: ${stdTransition()};
  border-radius: 100%;
  ${noUserSelect};
  ${noUserDrag};

  &::before {
    content: "";
    display: block;
    ${size("100%")};
    ${iconSrc(ICON_HEART_OUTLINED, true)};
    ${maskColor(COLOR_PRIMARY)};
    ${centerIcon("24px", true)};
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }

  ${(props) =>
    props.disabled &&
    css`
      pointer-events: none;
      opacity: 0.5;
    `};

  ${({ isSend }) =>
    isSend &&
    css`
      &::before {
        ${iconSrc(ICON_SEND_OUTLINED, true)};
      }
    `}
`;

export const UploadImageButton = styled.input`
  ${size("42px")};
  flex-shrink: 0;
  transition: ${stdTransition()};
  border-radius: 100%;

  &::before {
    content: "";
    display: block;
    ${size("100%")};
    ${iconSrc(ICON_IMAGE_OUTLINED, true)};
    ${maskColor(COLOR_PRIMARY)};
    ${centerIcon("24px", true)};
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }

  ${(props) =>
    props.disabled &&
    css`
      pointer-events: none;
      opacity: 0.5;
    `};
`;
