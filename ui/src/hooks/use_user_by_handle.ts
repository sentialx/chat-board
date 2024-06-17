import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import { User } from "../store/api_client";
import { useStore } from "../store/app_store_provider";

interface UseUserByHandleReturn {
  user: User | undefined;
  errorVisible: boolean;
}

export const useUserByHandle = (handle: string): UseUserByHandleReturn => {
  const emptyHandle = handle.startsWith("@") ? "@" : "";

  const store = useStore();
  const user = store.apiClient.users.get(handle);
  const [errorVisible, setErrorVisible] = useState(false);

  const handleNotFound = useCallback(() => {
    setErrorVisible(true);
  }, []);

  useEffect(() => {
    if (user || handle.trim() === emptyHandle) return;

    store.apiClient
      .getUsers(handle)
      .then((users) => {
        if (!users.has(handle)) {
          handleNotFound();
        }
      })
      .catch((e) => {
        handleNotFound();
      });
  }, [emptyHandle, handle, handleNotFound, store.apiClient, user]);

  return {
    user,
    errorVisible,
  };
};
