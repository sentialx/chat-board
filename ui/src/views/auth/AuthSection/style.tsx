import styled, { css } from "styled-components";

import { COLOR_PRIMARY, COLOR_SECONDARY } from "../../../constants/colors";
import {
  interBold,
  interExtraBold,
  interMedium,
} from "../../../mixins/typography";

import { buttonStyle } from "~/common/ui/components/Button";
import { centerHorizontal } from "~/common/ui/mixins/positioning";
import { noUserSelect } from "~/common/ui/mixins/ux";
import { WithActive } from "~/common/ui/types/state";

export const StyledAuthSection = styled.div`
  width: 100%;
  height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px 24px;
`;

// --slider-primary-color: #00ffbf;
// --slider-secondary-color: #60ed70;
// background: linear-gradient(
//   60deg,
//   var(--slider-primary-color) 32%,
//   var(--slider-secondary-color) 68%
// );

export const StyledForm = styled.form`
  width: 100%;
  max-width: 512px;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  padding: 32px;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  position: relative;
`;

export const FormHeader = styled.div`
  font-size: 16px;
  ${interBold};
`;

export const Input = styled.input`
  margin-top: 8px;
  ${buttonStyle};
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 0px 24px;

  &:focus {
    outline: 1px solid black;
  }
`;

export const Label = styled.div<{ error?: boolean }>`
  margin-top: 24px;
  font-size: 14px;
  ${interBold};

  ${({ error }) =>
    error &&
    css`
      color: red;
    `}
`;

export const SubmitButton = styled.input`
  margin-top: 32px;
  font-size: 14px ${buttonStyle};
  color: #000;
  background-color: ${COLOR_PRIMARY} !important;
  border-radius: 8px;
  padding: 0px 24px;
  ${interExtraBold};

  &:hover {
    background-color: ${COLOR_SECONDARY};
  }

  &:focus {
    outline: 2px solid black;
  }
`;

export const Tabs = styled.div`
  border-radius: 8px;
  display: flex;
  background-color: rgba(255, 255, 255, 0.06);
  margin-bottom: 16px;
  user-select: none;
  color: white;
`;

export const Tab = styled.div<WithActive>`
  padding: 10px 16px;
  border-radius: 6px;
  flex: 1;
  text-align: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.54);
  ${interBold}
  margin: 4px;

  &:hover {
    color: white;
  }

  ${({ $active }) =>
    $active &&
    css`
      background-color: white !important;
      color: black;
      cursor: default;

      &:hover {
        color: black;
      }
    `}
`;

export const ActionLabelsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
  ${noUserSelect};
`;

export const ActionLabel = styled.div`
  color: ${COLOR_PRIMARY};
  font-size: 14px;
  cursor: pointer;
  ${interBold};
`;

export const Error = styled.div`
  margin: 0 auto;
  margin-top: 16px;
  color: red;
  font-size: 14px;
  ${interBold};
`;
