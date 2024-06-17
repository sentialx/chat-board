import { ParsedUrlQuery } from "querystring";

import { action, computed, makeObservable, observable } from "mobx";
import Router from "next/router";

import { AUTH_ROUTE, PRIVACY_ROUTE, THREADS_ROUTE } from "../constants/routes";

import { ApiClient } from "./api_client";
import { AppStore } from "./app_store";
import { ChatStore } from "./chat_store";

export type NavigationHeader = {
  type: string;
} & (UserNavigationHeader | TextNavigationHeader | HeaderNavigationHeader);

export type UserNavigationHeader = {
  type: "user";
  userUuid: string;
};

export type TextNavigationHeader = {
  type: "text";
  text: string;
};

export type HeaderNavigationHeader = {
  type: "header";
  text: string;
};

export type NavigationPage = "inbox" | "chat" | "error";

export interface MenuTextItem {
  type: "text";
  text: string;
  url?: string;
  onClick?: () => void;
}

export interface MenuDividerItem {
  type: "divider";
}

export type MenuItem = MenuTextItem | MenuDividerItem;

export class NavigationStore {
  public pathname: string | undefined = undefined;
  public prevPathname: string | undefined = undefined;
  public queryParams: ParsedUrlQuery = {};

  public pageOverride: NavigationPage | undefined = undefined;

  constructor(
    private readonly appStore: AppStore,
    private readonly apiClient: ApiClient,
    private readonly chatStore: ChatStore,
  ) {
    makeObservable(this, {
      canGoBack: computed,
      isCreditsVisible: computed,
      pathname: observable,
      prevPathname: observable,
      isMenuVisible: computed,
      isInverted: computed,
      page: computed,
      queryParams: observable,
      isBackIconInverted: computed,
      header: computed,
      setPathname: action,
      goBack: action,
      setQueryParams: action,
      menu: computed,
    });
  }

  public get menu(): MenuItem[] {
    const items: MenuItem[] = [];

    if (this.apiClient.isAuthenticated) {
      // items.push({
      //   type: "text",
      //   text: "Account settings",
      // });
    } else {
      items.push({
        type: "text",
        text: "Log in",
        url: AUTH_ROUTE,
      });
    }

    items.push(
      // {
      //   type: "divider",
      // },
      {
        type: "text",
        text: "Terms of Service",
        url: "/privacy",
      },
    );

    if (this.apiClient.isAuthenticated) {
      items.push({
        type: "text",
        text: "Log out",
        onClick: (): void => {
          this.apiClient.logout();
        },
      });
    }

    return items;
  }

  public setPathname(pathname: string): void {
    this.prevPathname = this.pathname;
    this.pathname = pathname;
  }

  public setQueryParams(query: ParsedUrlQuery): void {
    this.queryParams = query;
  }

  public get page(): NavigationPage | undefined {
    if (this.pageOverride) return this.pageOverride;

    let page: NavigationPage | undefined = undefined;
    if (this.pathname === `${THREADS_ROUTE}/[chat_thread_uuid]`) {
      page = "chat";
    } else if (this.pathname === THREADS_ROUTE) {
      page = "inbox";
    }
    return page;
  }

  public get canGoBack(): boolean {
    const page = this.page;

    if (this.appStore.mediaPopup.visible || ["chat"].includes(page || "")) {
      return true;
    }

    if (page === "error" && this.prevPathname != null) {
      return true;
    }

    return false;
  }

  public get isBackIconInverted(): boolean {
    return false;
  }

  public get isInverted(): boolean {
    return this.appStore.mediaPopup.visible;
  }

  public get isCreditsVisible(): boolean {
    return !this.appStore.mediaPopup.visible && this.apiClient.isAuthenticated;
  }

  public get isMenuVisible(): boolean {
    return !this.appStore.mediaPopup.visible;
  }

  public get header(): NavigationHeader | undefined {
    const page = this.page;
    if (this.appStore.mediaPopup.visible) {
      return undefined;
    }
    if (page === "inbox") {
      return {
        type: "header",
        text: "Chats",
      };
    }
    if (page === "chat") {
      const receivers = this.chatStore.receivers;
      if (receivers?.length === 0) return;
      return {
        type: "user",
        userUuid: receivers[0].uuid,
      };
    }

    return undefined;
  }

  public goBack(): void {
    if (this.appStore.mediaPopup.visible) {
      this.appStore.mediaPopup.close();
      return;
    }
    let url: string | undefined;
    switch (this.page) {
      case "chat":
        url = THREADS_ROUTE;
        break;
    }
    if (url != null) {
      Router.push(url);
    }
  }

}
