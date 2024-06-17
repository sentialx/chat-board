import { observer } from "mobx-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";

import { THREADS_ROUTE } from "../../constants/routes";
import { useStore } from "../../store/app_store_provider";
import { UserNavigationHeader, MenuItem } from "../../store/navigation_store";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover";

import {
  Actions,
  BackButton,
  StyledCreditsButton,
  DisplayName,
  Info,
  StyledMenu,
  MenuButton,
  MenuText,
  MenuSeparator,
  Picture,
  StyledUserHeader,
  StyledNavigation,
  Username,
  Title,
  TextHeader,
  CreditsButtonIcon,
} from "./style";

interface MenuItemViewProps extends React.HTMLAttributes<HTMLDivElement> {
  data: MenuItem;
}

export const MenuItemView = observer((props: MenuItemViewProps) => {
  const { data } = props;
  switch (data.type) {
    case "divider": {
      return <MenuSeparator />;
    }
    case "text": {
      let child = (
        <MenuText {...props} onClick={data.onClick}>
          {data.text}
        </MenuText>
      );
      if (data.url != null) {
        child = <Link href={data.url}>{child}</Link>;
      }
      return child;
    }
    default:
      return undefined;
  }
});

interface MenuProps {
  items: MenuItem[];
}

export const Menu = observer((props: MenuProps) => {
  return (
    <StyledMenu>
      {props.items.map((data, i) => (
        <MenuItemView key={i} data={data} />
      ))}
    </StyledMenu>
  );
});

const UserHeader = observer(({ data }: { data: UserNavigationHeader }) => {
  const store = useStore();
  const user = store.apiClient.users.get(data.userUuid);
  if (user == null) return;

  return (
    <StyledUserHeader>
      <Picture src={user.avatar.url} draggable={false} />
      <Info>
        <DisplayName>{user.displayName}</DisplayName>
        <Username>{user.username}</Username>
      </Info>
    </StyledUserHeader>
  );
});

export const Navigation = observer(
  ({ children }: React.HTMLAttributes<HTMLDivElement>) => {
    const store = useStore();
    const navStore = store.navigationStore;
    const router = useRouter();
    const isInverted = navStore.isInverted;

    useEffect(() => {
      store.navigationStore.setPathname(router.pathname);
    }, [router.pathname]);

    useEffect(() => {
      store.navigationStore.setQueryParams(router.query);
    }, [router.query]);

    const header = navStore.header;

    return (
      <StyledNavigation invert={isInverted}>
        {navStore.canGoBack && (
          <BackButton onClick={navStore.goBack.bind(navStore)} invert />
        )}
        {header?.type === "user" && <UserHeader data={header} />}
        {header?.type === "text" && <Title>{header.text}</Title>}
        {header?.type === "header" && <TextHeader>{header.text}</TextHeader>}
        <Actions>
          {navStore.isMenuVisible && (
            <Popover placement="bottom-end">
              <PopoverTrigger>
                {(active) => <MenuButton $active={active} />}
              </PopoverTrigger>
              <PopoverContent style={{ outline: "none", zIndex: 3 }}>
                <Menu items={store.navigationStore.menu} />
              </PopoverContent>
            </Popover>
          )}
        </Actions>
        {children}
      </StyledNavigation>
    );
  },
);
