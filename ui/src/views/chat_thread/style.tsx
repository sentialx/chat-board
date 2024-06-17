import styled, { css } from "styled-components";

import { Image } from "~/common/ui/components/Image";
import { flexColumn, size } from "~/common/ui/mixins/box";
import { centerIcon } from "~/common/ui/mixins/image";
import { customScroll } from "~/common/ui/mixins/scroll";
import { shadows } from "~/common/ui/mixins/shadows";
import { hidden } from "~/common/ui/mixins/ux";
import { WithVisible } from "~/common/ui/types/state";

export const StyledView = styled.div`
  ${flexColumn};
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

export const ChatItems = styled.div<WithVisible>`
  width: 100%;
  height: fit-content;
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 16px;
  ${flexColumn};
  position: relative;
  ${customScroll({
    size: "6px",
    borderRadius: "0px",
    alwaysVisible: true,
    color: "rgba(0, 0, 0, 0.16)",
    hoverColor: "rgba(0, 0, 0, 0.38)",
    activeColor: "rgba(0, 0, 0, 0.52)",
  })};

  ${({ $visible }) =>
    !$visible &&
    css`
      ${hidden};
    `};
`;
