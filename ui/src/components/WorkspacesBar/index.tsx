import { observer } from "mobx-react";
import { useEffect } from "react";

import { Layout } from "../../components/Layout";
import { useStore } from "../../store/app_store_provider";

import { StyledWorkspacesBar } from "./style";
import { WorkspaceItem, WorkspaceItemView } from "./WorkspaceItem";

export const WorkspacesBar = observer(() => {
  const store = useStore();

  useEffect(() => {
    store.workspaceStore.fetch();
  }, []);

  const handleCreateWorkspace = () => {
    store.newWorkspacePopup.open({ name: "" });
  };

  return (
    <StyledWorkspacesBar>
      <div>
        {store.workspaceStore.workspaces.map((workspace) => (
          <WorkspaceItem
            workspace={workspace}
            key={workspace.uuid}
          ></WorkspaceItem>
        ))}
        <WorkspaceItemView name="+" onClick={handleCreateWorkspace} />
      </div>
    </StyledWorkspacesBar>
  );
});
