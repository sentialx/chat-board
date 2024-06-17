import { observer } from "mobx-react";
import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";

import { useStore } from "../../store/app_store_provider";
import { EditTaskPopup } from "../EditTaskPopup";
import { InvitePopup } from "../InvitePopup";
import { SettingsPopup } from "../SettingsPopup";
import { WorkspaceDetails } from "../WorkspaceDetails";

import { StyledLayout } from "./style";

export const WorkspaceLayout = observer(
  ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    const store = useStore();

    if (!store.workspaceStore.selected) {
      return null;
    }

    return (
      <StyledLayout {...props}>
        <InvitePopup />
        <SettingsPopup />
        <EditTaskPopup />
        <WorkspaceDetails workspace={store.workspaceStore.selected} />
        {children}
      </StyledLayout>
    );
  },
);
