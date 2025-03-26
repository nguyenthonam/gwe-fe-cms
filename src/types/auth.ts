export interface IAuthState {
  user: any;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ILoginRequest {
  email: string;
  password: string;
}
