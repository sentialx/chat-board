import { observer } from "mobx-react";
import React from "react";

import { useStore } from "../../store/app_store_provider";
import { Input } from "../../views/auth/AuthSection/style";
import { Popup, getPopupProps } from "../Popup";

import { Role, Roles, StyledSettingsPopup } from "./style";

export const SettingsPopup = observer(
  (props: React.HTMLAttributes<HTMLDivElement>) => {
    const store = useStore();

    const [creatingRole, setCreatingRole] = React.useState(false);

    React.useEffect(() => {
      if (!store.settingsPopup.visible) return;
      store.settingsStore.listRoles();
    }, [store.settingsPopup.visible]);

    const handleCreate = (e: React.KeyboardEvent<HTMLInputElement>) => {
      setCreatingRole(false);
      if (e.currentTarget.value === "") return;
      store.settingsStore.createRole(e.currentTarget.value);
    };

    return (
      <Popup {...getPopupProps(store.settingsPopup)}>
        <StyledSettingsPopup>
          <h2>Settings</h2>
          <h3>Roles</h3>
          <Roles>
            {store.settingsStore.roles.map((role) => (
              <Role key={role.uuid}>{role.name}</Role>
            ))}
            {creatingRole && (
              <Role>
                <input
                  style={{
                    background: "transparent",
                    outline: "none",
                    border: "none",
                    color: "white",
                  }}
                  autoFocus
                  type="text"
                  onBlur={handleCreate as any}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      handleCreate(e);
                    }
                  }}
                />
              </Role>
            )}
            <button onClick={() => setCreatingRole(true)}>New role</button>
          </Roles>
        </StyledSettingsPopup>
      </Popup>
    );
  },
);
