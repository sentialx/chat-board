import { css } from "styled-components";

import { noUserSelect } from "./ux";

export const customAnchor = css`
  color: inherit;
  text-decoration: none;

  &:focus {
    outline: none;
  }
`;

export const customUl = css`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const customLi = css`
  margin: 0;
`;

export const customButton = css`
  outline: none;
  border: none;
  background-color: transparent;
  font-family: inherit;
  ${noUserSelect};
`;

export const customInput = css`
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  border: none;
  outline: none;
  background-color: transparent;

  &::placeholder {
    ${noUserSelect};
  }
`;

export const customFocusOutline = css`
  &:focus {
    outline: none;
  }
`;

export const customSmall = css`
  font-size: inherit;
  display: block;
`;

export const customFigure = css`
  margin-block: 0px;
  margin-inline: 0px;
`;

export const customStrong = css`
  font-weight: inherit;
  line-height: inherit;
`;

export const customSelect = css`
  ${customInput};
  -webkit-appearance: none;
  -moz-appearance: none;
  &::-ms-expand {
    display: none;
  }
`;
