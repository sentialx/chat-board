import { observer } from "mobx-react";
import React from "react";

import { useStore } from "../../store/app_store_provider";
import { Input } from "../../views/auth/AuthSection/style";
import { Popup, getPopupProps } from "../Popup";

import { StyledNewWorkspacePopup } from "./style";

export const InvitePopup = observer(
  (props: React.HTMLAttributes<HTMLDivElement>) => {
    const store = useStore();
    const [email, setEmail] = React.useState<string>("");

    return (
      <Popup {...getPopupProps(store.invitePopup)}>
        <StyledNewWorkspacePopup>
          <h2>Invite people</h2>
          <Input
            type="text"
            placeholder="Enter email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <br />
          <button
            onClick={() => {
              store.invitePopup.setVisible(false);
              if (email === "") return;
              store.workspaceStore.addUser(email);
              setEmail("");
            }}
          >
            Invite
          </button>
        </StyledNewWorkspacePopup>
      </Popup>
    );
  },
);
