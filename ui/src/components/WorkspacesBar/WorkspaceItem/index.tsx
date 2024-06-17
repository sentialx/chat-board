import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { useStore } from "../../../store/app_store_provider";

import { StyledWorkspaceItem } from "./style";

import { WorkspaceApi } from "~/eryk/licencjat/common";

interface ItemProps {
  workspace: WorkspaceApi;
}

interface ViewProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  selected?: boolean;
}

export const WorkspaceItemView = observer((props: ViewProps) => {
  return (
    <StyledWorkspaceItem {...props}>
      <div>{props.name[0].toUpperCase()}</div>
    </StyledWorkspaceItem>
  );
});

export const WorkspaceItem = observer((props: ItemProps) => {
  const router = useRouter();
  const store = useStore();

  const handleClick = () => {
    router.push(`/${props.workspace.uuid}`);
  };

  return (
    <WorkspaceItemView
      selected={store.workspaceStore.selected?.uuid === props.workspace.uuid}
      name={props.workspace.name}
      onClick={handleClick}
    />
  );
});
