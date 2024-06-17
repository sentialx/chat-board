import styled, { css, keyframes } from "styled-components";

import { COLOR_PRIMARY } from "../../../constants/colors";
import {
  ICON_DIAMOND_OUTLINED,
  ICON_DONE,
  ICON_EYE_OUTLINED,
} from "../../../constants/icons";
import {
  interBold,
  interExtraBold,
  interMedium,
  singleLine,
} from "../../../mixins/typography";

import { Image } from "~/common/ui/components/Image";
import { stdTransition } from "~/common/ui/mixins/animations";
import { circle, flexColumn, maxSize, size } from "~/common/ui/mixins/box";
import { fixChromiumBlur } from "~/common/ui/mixins/bugs";
import { centerIcon, iconSrc, invert } from "~/common/ui/mixins/image";
import { centerBoth } from "~/common/ui/mixins/positioning";
import { asVar } from "~/common/ui/mixins/themes";
import {
  noUserSelect,
  noUserDrag,
  hidden,
  visible,
} from "~/common/ui/mixins/ux";
import {
  WithCanAccess,
  WithActive,
  WithVisible,
} from "~/common/ui/types/state";

export const VAR_CHAT_MESSAGE_IMAGE_GRID_IMAGE_SIZE =
  "--chat-message-image-grid-image-size";

export interface WithIsOwn {
  isOwn?: boolean;
}

export const StyledChatEvent = styled.div<WithIsOwn>`
  width: 100%;
  margin-top: 8px;
  border-radius: 16px;
  font-size: 16px;
  padding-left: 16px;
  padding-right: 8px;
  display: flex;
  flex-shrink: 0;
  ${({ isOwn }) =>
    isOwn &&
    css`
      flex-direction: row-reverse;
    `}
`;

export const UserAvatar = styled(Image)`
  flex-shrink: 0;
  ${size("32px")}
  ${circle};
  margin-top: auto;
`;

export const BodyContainer = styled.div`
  max-width: 50%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 8px;
`;

export const StyledBody = styled.div<WithIsOwn>`
  display: flex;
  flex-direction: column;
  width: fit-content;
  gap: 4px;

  ${({ isOwn }) =>
    isOwn &&
    css`
      margin-left: auto;
    `}
`;

export const StyledImageGridBlock = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 16px;
  ${noUserSelect};
  ${noUserDrag};
  gap: 8px;
  ${VAR_CHAT_MESSAGE_IMAGE_GRID_IMAGE_SIZE}: 256px;

  & img {
    object-fit: contain;
    cursor: zoom-in;
    ${maxSize(asVar(VAR_CHAT_MESSAGE_IMAGE_GRID_IMAGE_SIZE))}
  }
`;

export const StyledImageBlock = styled.div`
  overflow: hidden;
  display: flex;
  ${noUserSelect};
  ${noUserDrag};
  ${VAR_CHAT_MESSAGE_IMAGE_GRID_IMAGE_SIZE}: 256px;

  & img {
    object-fit: contain;
    cursor: pointer;
    width: 100%;
    border-radius: 24px;
  }
`;

export const ImgContainer = styled.div`
  position: relative;
`;

const baseTextStyle = css`
  border-radius: 16px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: text;
  background-color: rgba(255, 255, 255, 0.1);

  & p {
    margin: 0px;
  }
`;

export const Text = styled.div<WithIsOwn>`
  ${baseTextStyle};

  ${({ isOwn }) =>
    isOwn &&
    css`
      background-color: ${COLOR_PRIMARY};
      color: black;
    `}
`;

const typingAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-2px);
  }
  100% {
    transform: translateY(0px);
  }
`;

export const TypingBlock = styled.div`
  height: 28px;
  ${baseTextStyle};
  display: flex;
  align-items: center;
  ${noUserSelect};
  flex-shrink: 0;

  & > div {
    border-radius: 100%;
    background-color: #fff;
    ${size("4px")}
    border-radius: 100%;
    opacity: 0.5;
    margin: 0px 2px;
    animation: ${typingAnimation} 1s infinite;
    ${fixChromiumBlur};
  }

  & > div:nth-child(1) {
    animation-delay: 0s;
  }

  & > div:nth-child(2) {
    animation-delay: 0.2s;
  }

  & > div:nth-child(3) {
    animation-delay: 0.4s;
  }
`;

export const TextDivider = styled.div`
  width: 100%;
  text-align: center;
  font-size: 12px;
  opacity: 0.5;
  ${interBold};
  padding: 24px;
`;

export const IndicatorContainer = styled.div`
  ${size("14px")};
  margin-top: auto;
  margin-left: 4px;
`;

export const SendIndicator = styled.div<{ isSending?: boolean }>`
  ${size("100%")};
  border-radius: 100%;

  ${({ isSending }) =>
    isSending
      ? css`
          border: 2px solid ${COLOR_PRIMARY};
        `
      : css`
          background-color: ${COLOR_PRIMARY};

          &::after {
            content: "";
            display: block;
            ${size("100%")};
            ${centerIcon("12px")};
            ${iconSrc(ICON_DONE)};

          }
        `}
`;

export const ReadIndicator = styled.div`
  ${size("100%")};
  border-radius: 100%;
  ${size("100%")};
  ${centerIcon()};
`;
