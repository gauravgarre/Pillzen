export interface AuthProviderProps {
  children: any;
}

export interface UserData {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: number;
  isAnonymous: boolean;
  tenantId: string;
  providerData: {
    uid: string;
    displayName: string;
    photoURL: string;
    email: string;
    phoneNumber: string;
    providerId: string;
  }[];
  apiKey: string;
  appName: string;
  authDomain: string;
  stsTokenManager: {
    apiKay: string;
    refreshToken: string;
    accessToken: string;
    expirationTime: number;
  };
  redirectEventId: unknown;
  lastLoginAt: string;
  createdAt: string;
  multiFactor: {
    enrolledFactors: unknown[];
  };
}

export interface UseProvideAuthReturned {
  user: UserData;
  handleSignUp: (
    email: string,
    password: string,
    {
      fullName,
    }: {
      fullName: string;
      phoneNumber: string;
    }
  ) => void;
  handleLogin: (email: string, password: string) => void;
  handleLogOut: () => void;
  emailError: string;
  passwordError: string;
  runningAuth: boolean;
  clearErrors: () => void;
  emailVerified: boolean;
  setEmailVerified: (state: boolean) => void;
  basicUserInfoDB: BasicUserInfoDBProps;
  userInfoReqFailed: boolean;
  getUserData: () => void;
  showLogOutWarning: boolean;
  setShowLogOutWarning: (state: boolean) => void;
  setBasicUserInfoDB: React.Dispatch<
    React.SetStateAction<BasicUserInfoDBProps>
  >;
  setLoginLoadingDispatch: React.Dispatch<{
    type: loginLoadingActions;
  }>;
  loginLoading: loginLoadingState;
}

export interface BasicUserInfoDBProps {
  basicLikedRecipesInfo: {
    [key: string]: boolean;
  };
  fullName: string;
  accountCreated: Date;
  profileImg: string;
  email: string;
}

export interface loginLoadingState {
  accountCreating: boolean;
  validatingLogin: boolean;
}

export type loginLoadingActions =
  | "creatingAccount"
  | "creatingAccountCP"
  | "loginCheck"
  | "loginCheckCP";
