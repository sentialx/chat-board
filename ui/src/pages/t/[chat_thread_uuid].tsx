import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { Layout } from "../../components/Layout";
import { WorkspaceLayout } from "../../components/WorkspaceLayout";
import { useStore } from "../../store/app_store_provider";
import { ChatThreadView } from "../../views/chat_thread";

export const ChatThread = observer(() => {
  const router = useRouter();
  const store = useStore();
  const { chat_thread_uuid: threadUuid } = router.query;

  useEffect(() => {
    if (!(typeof threadUuid === "string")) return;
    store.chatStore.load(threadUuid);
  }, [store.chatStore, threadUuid]);

  return (
    <Layout>
      <WorkspaceLayout>
        <ChatThreadView chat={store.chatStore} />
      </WorkspaceLayout>
    </Layout>
  );
});

export default ChatThread;
