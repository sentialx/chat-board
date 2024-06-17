import { observer } from "mobx-react";
import { useEffect } from "react";

import { Layout } from "../../components/Layout";
import { useStore } from "../../store/app_store_provider";

import { Threads } from "./style";
import { Thread } from "./Thread";

export const InboxView = observer(() => {
  const store = useStore();

  useEffect(() => {
    store.apiClient.getChatThreads();
  }, []);

  return (
    <Layout>
      <Threads>
        {[...store.apiClient.chatThreads.values()].map((r) => (
          <Thread key={r.uuid} data={r} />
        ))}
      </Threads>
    </Layout>
  );
});
