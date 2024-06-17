import { observer } from "mobx-react";
import { Router, useRouter } from "next/router";
import React, { useEffect, useRef } from "react";

import { AUTH_ROUTE } from "../../constants/routes";
import { useStore } from "../../store/app_store_provider";
import { MediaPopup } from "../MediaPopup";
import { NewWorkspacePopup } from "../NewWorkspacePopup";
import { WorkspacesBar } from "../WorkspacesBar";

import { LayoutProps, StyledLayout } from "./style";

export const Layout = observer(
  ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & LayoutProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const store = useStore();
    const router = useRouter();

    useEffect(() => {
      (async () => {
        await store.apiClient.getMe();
        if (!store.apiClient.isAuthenticated) {
          router.push(AUTH_ROUTE);
        }
      })();
    }, []);

    useEffect(() => {
      const resize = () => {
        if (!ref.current) return;
        ref.current.style.height = window.visualViewport?.height + "px";
      };

      window.addEventListener("resize", resize);

      return () => {
        window.removeEventListener("resize", resize);
      };
    }, []);

    return (
      <StyledLayout ref={ref} {...props}>
        <MediaPopup />
        <NewWorkspacePopup />
        <WorkspacesBar />
        {children}
      </StyledLayout>
    );
  },
);
