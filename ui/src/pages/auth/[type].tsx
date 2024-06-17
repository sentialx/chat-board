import { useRouter } from "next/router";

import { AuthView } from "../../views/auth";

export function Auth() {
  const router = useRouter();
  const { type } = router.query;

  return <AuthView login={type !== "register"} />;
}

export default Auth;
