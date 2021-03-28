import React, { useState, useEffect, createContext, useReducer } from "react";
import * as firebase from "firebase/app";
import "firebase/auth";
import {
  AuthProviderProps,
  UseProvideAuthReturned,
  UserData,
  BasicUserInfoDBProps,
  loginLoadingActions,
  loginLoadingState,
} from "./types";
import axios from "axios";

if (!firebase.default.apps.length) {
  firebase.default.initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID,
  });
}

const acCreatingReducer = (
  state: loginLoadingState,
  action: { type: loginLoadingActions }
): loginLoadingState => {
  switch (action.type) {
    case "creatingAccount":
      return { validatingLogin: false, accountCreating: true };
    case "loginCheck":
      return { validatingLogin: true, accountCreating: false };
    case "creatingAccountCP":
      return { validatingLogin: false, accountCreating: false };
    case "loginCheckCP":
      return { validatingLogin: false, accountCreating: false };
    default:
      throw new Error();
  }
};

const useProvideAuth = (): UseProvideAuthReturned => {
  const [user, setUser] = useState<UserData | undefined>();
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [runningAuth, setRunningAuth] = useState(true); //tracking the state of `onAuthStateChange`. We need to handle some tasks if the authentication process is still running.
  const [emailVerified, setEmailVerified] = useState(true);
  //users info on the database
  const [basicUserInfoDB, setBasicUserInfoDB] = useState<
    BasicUserInfoDBProps | undefined
  >(undefined);
  const [userInfoReqFailed, setUserInfoReqFailed] = useState(false); //checking if getting userInfo from database failed
  const [showLogOutWarning, setShowLogOutWarning] = useState(false);
  //to show a loading bar when the users signs in
  const [loginLoading, setLoginLoadingDispatch] = useReducer(
    acCreatingReducer,
    {
      accountCreating: false,
      validatingLogin: false,
    }
  );

  const clearErrors = (): void => {
    setEmailError("");
    setPasswordError("");
  };

  //a function that gets user data from the database and updates `basicUserInfoDB` state
  const getUserData = (): void => {
    console.log(
      "I'm calling the 'getUserData' function to get user-data from the DB"
    );
    firebase.default
      .auth()
      .currentUser.getIdToken(/* forceRefresh */ true)
      .then((idToken: string) => {
        axios
          .get("/api/get-users-data", {
            headers: {
              token: idToken,
            },
          })
          .then((res) => {
            setBasicUserInfoDB(res.data);
            setUserInfoReqFailed(false);
          })
          .catch((e: any) => {
            setUserInfoReqFailed(true);
            console.log(e);
          });
      })

      .catch((e: any) => {
        setUserInfoReqFailed(true);
        console.log(e);
      });
  };

  const handleLogin = (email: string, password: string): void => {
    clearErrors();
    setLoginLoadingDispatch({ type: "loginCheck" });

    firebase.default
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(({ user }) => {
        setLoginLoadingDispatch({ type: "creatingAccountCP" });

        // getUserData(); //getting user data from the database
        //if user email is not verified
        if (!user.emailVerified) {
          setEmailVerified(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoginLoadingDispatch({ type: "creatingAccountCP" });
        switch (err.code) {
          case "auth/invalid-email":
          case "auth/user-disabled":
            setEmailError(err.message);
            break;
          case "auth/user-not-found":
            setEmailError("No user found associated with this email");
            break;
          case "auth/wrong-password":
            setPasswordError("The password is invalid/ password doesn't match");
            break;
          default:
            setEmailError("Something went wrong");
            setPasswordError(
              "Something went wrong, try again. Check you network connection or contact us"
            );
            break;
        }
      });
  };
  const handleSignUp = (
    email: string,
    password: string,
    {
      fullName,
      phoneNumber,
    }: {
      fullName: string;
      phoneNumber: string;
    }
  ): void => {
    console.log(phoneNumber);
    setLoginLoadingDispatch({ type: "creatingAccount" });
    clearErrors(); //clearing form input errors

    firebase.default
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        result.user
          .updateProfile({
            displayName: fullName,
          })
          .then(() => {
            setLoginLoadingDispatch({ type: "creatingAccountCP" });

            firebase.default
              .auth()
              .currentUser.getIdToken(/* forceRefresh */ true)
              .then((idToken: string) => {
                //not passing down any user information except the users token, will use that in the backend api to get users info
                axios
                  .post(
                    "/api/create-new-user",
                    { phoneNumber },
                    {
                      headers: {
                        token: idToken,
                      },
                    }
                  )
                  .then(() => {
                    console.log("successful");
                    // getUserData(); //call this function at this stage so we can fetch user data once the account has been created, and update the `userInfoDB` state
                  })
                  .catch(() => {
                    console.log("failed created user account on the db");
                  });
              });
          });
      })
      .catch((err) => {
        setLoginLoadingDispatch({ type: "creatingAccountCP" });
        console.log(err);
        switch (err.code) {
          case "auth/email-already-in-use":
          case "auth/invalid-email":
            setEmailError(err.message);
            break;
          case "auth/weak-password":
            setPasswordError(err.message);
            break;
          default:
            setEmailError("Something went wrong");
            setPasswordError("Something went wrong, try again");
            break;
        }
      });
  };
  const handleLogOut = (): void => {
    setShowLogOutWarning(true);
    firebase.default.auth().signOut();
    setBasicUserInfoDB(undefined); //removing users data from the state
  };

  const authListener = (): void => {
    firebase.default.auth().onAuthStateChanged((user: any) => {
      if (user) {
        setShowLogOutWarning(false);
        // getUserData(); //getting user data from the DB, everytime auth state changes
        setUser(user);
        setRunningAuth(false);
        setUserInfoReqFailed(false);

        //if user email is not verified
        if (!user.emailVerified) {
          setEmailVerified(false);
        }
      } else {
        setUser(undefined);
        setRunningAuth(false);
      }
    });
  };

  useEffect(() => {
    setRunningAuth(true);
    authListener();
  }, []);

  return {
    user,
    handleSignUp,
    handleLogin,
    handleLogOut,
    emailError,
    passwordError,
    runningAuth,
    clearErrors,
    emailVerified,
    setEmailVerified,
    basicUserInfoDB,
    userInfoReqFailed,
    getUserData,
    showLogOutWarning,
    setShowLogOutWarning,
    setBasicUserInfoDB,
    setLoginLoadingDispatch,
    loginLoading,
  };
};

export const AuthContext = createContext<UseProvideAuthReturned | undefined>(
  undefined
);

export const AuthProvider: React.FC<AuthProviderProps> = (
  props: AuthProviderProps
) => {
  const { children } = props;
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
