import { observer } from "mobx-react";
import React from "react";

import { useStore } from "../../store/app_store_provider";
import { Popup, getPopupProps } from "../Popup";

import { StyledMediaPopup } from "./style";

export const MediaPopup = observer(
  (props: React.HTMLAttributes<HTMLDivElement>) => {
    const store = useStore();

    return (
      <Popup {...getPopupProps(store.mediaPopup)}>
        <StyledMediaPopup>
          <img src={store.mediaPopup.data?.url} draggable={false} />
        </StyledMediaPopup>
      </Popup>
    );
  },
);
