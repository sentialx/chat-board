import styled, { css, keyframes } from "styled-components";

import { COLOR_PRIMARY } from "../../constants/colors";
import {
  ICON_ARROW_BACK_OUTLINED,
  ICON_DIAMOND_OUTLINED,
  ICON_MORE,
} from "../../constants/icons";
import {
  interBold,
  interExtraBold,
  interRegular,
  singleLine,
} from "../../mixins/typography";

import { Image } from "~/common/ui/components/Image";
import { stdTransition } from "~/common/ui/mixins/animations";
import { flexRow, circle, size } from "~/common/ui/mixins/box";
import {
  iconSrc,
  centerIcon,
  invert,
  maskColor,
} from "~/common/ui/mixins/image";
import { shadows } from "~/common/ui/mixins/shadows";
import { noUserSelect } from "~/common/ui/mixins/ux";
import { WithInvert, WithActive } from "~/common/ui/types/state";
import { customAnchor } from "~/common/ui/mixins/default_styles";

export const VAR_NAVIGATION_HEIGHT = "--navigation-height";

export const StyledNavigation = styled.div<WithInvert>`
  width: 100%;
  height: var(${VAR_NAVIGATION_HEIGHT});
  display: flex;
  align-items: center;
  top: 0;
  left: 0;
  position: sticky;
  padding: 4px 24px;
  flex-shrink: 0;
  ${noUserSelect};
  color: #fff;
  background-color: #212121;
  z-index: 2;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);

  ${({ invert }) =>
    invert &&
    css`
      color: #000;
      background-color: #000;
    `}
`;

export const StyledUserHeader = styled.div`
  transition: ${stdTransition()};
  ${flexRow};
  align-items: center;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  color: #fff;
  overflow: hidden;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
`;

export const BackButton = styled.div<WithInvert>`
  ${size("42px")};
  flex-shrink: 0;
  border-radius: 100%;
  margin-left: -16px;
  margin-right: 4px;

  &::before {
    content: "";
    display: block;
    ${size("100%")};
    ${iconSrc(ICON_ARROW_BACK_OUTLINED, false)};
    ${centerIcon("24px")};
    transition: ${stdTransition()};
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.12);
  }

  ${({ invert: isInverted }) =>
    isInverted &&
    css`
      &::before {
        ${invert};
      }

      &:hover {
        background-color: rgba(255, 255, 255, 0.12);
      }
    `}
`;

export const Picture = styled(Image)`
  ${size("42px")};
  ${centerIcon()};
  ${circle};
  flex-shrink: 0;
  background-color: rgba(0, 0, 0, 0.12);
  margin-right: 12px;
`;

export const Info = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Title = styled.div`
  font-size: 14px;
  ${interExtraBold};
  ${singleLine};
`;

export const TextHeader = styled.div`
  font-size: 20px;
  ${interExtraBold};
`;

export const DisplayName = styled.span`
  font-size: 14px;
  ${interExtraBold};
  ${singleLine};
`;

export const Username = styled.span`
  font-size: 12px;
  opacity: 0.5;
  margin-top: 2px;
  ${singleLine};
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const activatedStyle = css<WithActive>`
  ${(props) =>
    props.$active &&
    css`
      background-color: rgba(0, 0, 0, 0.08);
    `}
`;

export const IconButton = styled.div`
  ${size("42px")};
  flex-shrink: 0;
  transition: ${stdTransition()};
  border-radius: 100%;

  &::before {
    content: "";
    display: block;
    ${size("100%")};
    ${centerIcon("24px", true)};
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.06);
  }

  ${activatedStyle}
`;

export const CreditsButtonIcon = styled.div`
  ${size("24px")};
  ${centerIcon("24px", true)};
  ${maskColor(COLOR_PRIMARY)};
  ${iconSrc(ICON_DIAMOND_OUTLINED, true)};
  margin-right: 6px;
`;

export const StyledCreditsButton = styled.div<WithActive>`
  padding: 0 10px;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  position: relative;
  ${interBold};

  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }

  ${activatedStyle}
`;

export const MenuButton = styled(IconButton)`
  &:before {
    ${maskColor("#fff")};
    ${iconSrc(ICON_MORE, true)};
  }
`;

const menuFadeInAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0px);
  }
`;

export const StyledMenu = styled.div`
  box-shadow: ${shadows(16)};
  border-radius: 8px;
  z-index: 9999;
  outline: none;
  opacity: 0;
  animation: ${menuFadeInAnimation} 0.1s ease-in-out forwards;
  position: relative;
  padding: 4px 0;
  background-color: #3b3b3b;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  cursor: default;
  ${noUserSelect};

  & a {
    ${customAnchor};
  }
`;

export const MenuText = styled.div`
  ${flexRow};
  align-items: center;
  transition: ${stdTransition()};
  padding: 10px 10px;
  margin: 0 4px;
  border-radius: 6px;
  ${interRegular};
  position: relative;

  &:hover {
    background-color: rgba(255, 255, 255, 0.06);
  }
`;

export const MenuSeparator = styled.div`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.12);
  width: 100%;
  margin: 4px 0;
`;
