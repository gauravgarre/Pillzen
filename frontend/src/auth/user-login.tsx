import React, { useEffect, useContext } from "react";
import CreateAccount from "../components/auth/create-account/create-account";
import Login from "../components/auth/login/login";
import { AuthContext } from "../auth/main-auth-functionality";
import { useRouter } from "next/router";
import { Spinner, Box } from "@chakra-ui/react";

interface Props {
  authType: "login" | "createAccount";
}

const UserLogin: React.FC<Props> = (props: Props) => {
  const { authType } = props;

  const router = useRouter();

  const { user, runningAuth } = useContext(AuthContext);

  useEffect(() => {
    //if the auth check if complete and the user is not logged-in, sending him to the join/login page
    if (user && !runningAuth) {
      router.push("/new-prescription");
    }
  }, [user, runningAuth]);
  return (
    <div>
      {runningAuth ? (
        <Box w="100px" m="0 auto" mt="300px">
          <Spinner size="lg" />
        </Box>
      ) : authType === "createAccount" ? (
        <CreateAccount />
      ) : (
        <Login />
      )}
    </div>
  );
};

export default UserLogin;
