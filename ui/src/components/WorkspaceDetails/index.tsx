import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import { THREADS_ROUTE } from "../../constants/routes";
import { useStore } from "../../store/app_store_provider";
import { MenuItem } from "../../store/navigation_store";
import { Menu, MenuItemView } from "../Navigation";
import { StyledMenu } from "../Navigation/style";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover";

import {
  StyledDetails,
  Title,
  StyledUser,
  Users,
  MiniRoles,
  MiniRole,
  More,
  Role,
  Roles,
} from "./style";

import { WorkspaceApi, ApiUser, RoleApi } from "~/eryk/licencjat/common";

interface Props {
  workspace: WorkspaceApi;
}

interface UserProps {
  user: ApiUser;
}

const User = observer((props: UserProps) => {
  const store = useStore();
  const router = useRouter();

  const [privileged, setPrivileged] = useState(false);
  const [roles, setRoles] = useState<RoleApi[]>([]);

  const availableRoles = store.settingsStore.roles;

  const refreshRoles = useCallback(async () => {
    store.workspaceStore.getRoles(props.user.uuid).then(setRoles);
    store.workspaceStore.amIAdmin().then(setPrivileged);
  }, [props.user.uuid, store.workspaceStore]);

  useEffect(() => {
    store.settingsStore.listRoles();
    refreshRoles();
  }, [
    store.workspaceStore._selected,
    props.user.uuid,
    store.settingsStore,
    refreshRoles,
  ]);

  const thread = store.chatStore.data;

  const handleClick = async () => {
    const thread = await store.chatStore.getThreadWithUser(props.user.uuid);
    if (!thread) return;
    router.push(`${THREADS_ROUTE}/${thread.uuid}`);
  };

  const isSelf = props.user.uuid === store.apiClient.me?.uuid;
  const maxParticipantsCount = isSelf ? 1 : 2;

  let isSelected = false;
  if (thread?.participants.length === maxParticipantsCount) {
    if (
      thread.participants.includes(props.user.uuid) &&
      router.pathname.startsWith(`${THREADS_ROUTE}`)
    ) {
      isSelected = thread.workspaceUuid === store.workspaceStore.selected?.uuid;
    }
  }

  const menuItems: MenuItem[] = [
    {
      type: "divider",
    },
    {
      type: "text",
      text: "Remove from workspace",
      onClick: () => {},
    },
  ];

  const onRoleClick = (role: RoleApi) => {
    return async () => {
      await store.workspaceStore.toggleRole(props.user.uuid, role.uuid);
      await refreshRoles();
    };
  };

  return (
    <StyledUser $selected={isSelected} onClick={handleClick}>
      {props.user.displayName}
      <MiniRoles>
        {roles.map((role) => (
          <MiniRole key={role.uuid}>{role.name}</MiniRole>
        ))}
      </MiniRoles>
      <div style={{ flex: 1 }} />
      {privileged && (
        <Popover placement="bottom-start">
          <PopoverTrigger onClick={(e) => e.stopPropagation()}>
            {(active) => <More />}
          </PopoverTrigger>
          <PopoverContent
            onClick={(e) => e.stopPropagation()}
            style={{ outline: "none", zIndex: 3 }}
          >
            <StyledMenu>
              <Roles>
                {availableRoles.map((role) => (
                  <Role
                    $selected={roles.some((x) => x.uuid === role.uuid)}
                    key={role.uuid}
                    onClick={onRoleClick(role)}
                  >
                    {role.name}
                  </Role>
                ))}
              </Roles>
              {menuItems.map((data, i) => (
                <MenuItemView key={i} data={data} />
              ))}
            </StyledMenu>
          </PopoverContent>
        </Popover>
      )}
    </StyledUser>
  );
});

export const WorkspaceDetails = observer((props: Props) => {
  const store = useStore();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const handleTitleClick = async () => {
    const isPrivileged = await store.workspaceStore.amIAdmin();

    const menuItems: MenuItem[] = isPrivileged
      ? [
          {
            type: "text",
            text: "Invite people",
            onClick: () => {
              store.invitePopup.open();
            },
          },
          {
            type: "text",
            text: "Settings",
            onClick: () => {
              store.settingsPopup.open();
            },
          },
          {
            type: "divider",
          },
        ]
      : [];

    menuItems.push({
      type: "text",
      text: "Leave workspace",
      onClick: () => {},
    });

    setMenuItems(menuItems);
  };

  return (
    <StyledDetails>
      <Popover placement="bottom-end">
        <PopoverTrigger onClick={handleTitleClick}>
          {(active) => <Title $active={active}>{props.workspace.name}</Title>}
        </PopoverTrigger>
        <PopoverContent style={{ outline: "none", zIndex: 3 }}>
          <Menu items={menuItems} />
        </PopoverContent>
      </Popover>
      <Users>
        {props.workspace.users.map((u) => (
          <User user={u} key={u.uuid} />
        ))}
      </Users>
    </StyledDetails>
  );
});
