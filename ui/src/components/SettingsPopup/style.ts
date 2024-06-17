import styled from "styled-components";
import { noScroll, noUserDrag, noUserSelect } from "~/common/ui/mixins/ux";
import { WithVisible } from "~/common/ui/types/state";

export const StyledSettingsPopup = styled.div<WithVisible>`
  max-width: calc(100% - 64px);
  max-height: calc(100% - 64px);
  z-index: 100;
  position: fixed;
  align-items: center;
  ${noUserDrag};
  ${noUserSelect};
  ${noScroll};
  background-color: #212121;
  border-radius: 16px;
  padding: 32px;

  & img {
    width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

export const Role = styled.div`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
`;

export const Roles = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;
