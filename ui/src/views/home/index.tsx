import { observer } from "mobx-react";
import { useEffect } from "react";

import { Layout } from "../../components/Layout";
import { useStore } from "../../store/app_store_provider";

export const HomeView = observer(() => {
  const store = useStore();

  return <Layout>No workspace selected</Layout>;
});
