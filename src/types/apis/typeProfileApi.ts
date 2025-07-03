import { EGENDER, IBasicContactInfor } from "../typeGlobals";
import { IIdentityUser } from "../typeUser";

export interface IUpdateProfileRequest {
  contact?: IBasicContactInfor;
  gender?: EGENDER; // giới tính
  birthday?: Date; // Ngày sinh DD/MM/YYYY
  avatar?: string;
  identity_key?: IIdentityUser; // căn cước or cmnd
}

export interface IUpdatePasswordRequest {
  pwd: string;
  newPassword: string;
}
