import { IUser } from "./typeUser";

export interface IAuthState {
  profile: IUser | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}
