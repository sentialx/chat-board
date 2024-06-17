import { observer } from "mobx-react";
import React from "react";

import { useStore } from "../../store/app_store_provider";
import { Input } from "../../views/auth/AuthSection/style";
import { Popup, getPopupProps } from "../Popup";

import { StyledNewWorkspacePopup } from "./style";

export const NewWorkspacePopup = observer(
  (props: React.HTMLAttributes<HTMLDivElement>) => {
    const store = useStore();

    const [name, setName] = React.useState("");

    return (
      <Popup {...getPopupProps(store.newWorkspacePopup)}>
        <StyledNewWorkspacePopup>
          <h2>Create a new workspace</h2>
          <p>Enter the name of your new workspace</p>
          <Input
            type="text"
            placeholder="Workspace name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <br />
          <button
            onClick={() => {
              store.newWorkspacePopup.setVisible(false);
              store.workspaceStore.create({ name });
            }}
          >
            Create
          </button>
        </StyledNewWorkspacePopup>
      </Popup>
    );
  },
);
