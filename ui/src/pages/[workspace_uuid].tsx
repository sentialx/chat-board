import { useRouter } from "next/router";
import { useEffect } from "react";

import { Layout } from "../components/Layout";
import { WorkspaceLayout } from "../components/WorkspaceLayout";
import { useStore } from "../store/app_store_provider";
import { BoardView } from "../views/Board";

export function Workspace() {
  const router = useRouter();
  const store = useStore();
  const { workspace_uuid: workspaceUuid } = router.query;

  useEffect(() => {
    if (!(typeof workspaceUuid === "string")) return;
    (async () => {
      await store.workspaceStore.fetch();
      store.workspaceStore.select(workspaceUuid);
    })();
  }, [store.chatStore, store.workspaceStore, workspaceUuid]);

  return (
    <Layout>
      <WorkspaceLayout>
        <BoardView />
      </WorkspaceLayout>
    </Layout>
  );
}

export default Workspace;
