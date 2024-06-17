import { observer } from "mobx-react";
import Router, { useRouter } from "next/router";
import { useEffect } from "react";

import { AUTH_ROUTE } from "../constants/routes";
import { useStore } from "../store/app_store_provider";
import { HomeView } from "../views/home";

export function Home() {
  return <HomeView />;
}

export default Home;
