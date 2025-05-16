import { EGENDER, ERECORD_STATUS, EUSER_ROLES, IBaseRecord, IBasicContactInfor } from "./typeGlobals";

export interface IIdentityUser {
  id: string; // CMND hoặc CCCD
  createdAt: string; // Ngày cấp (DD/MM/YYYY)
  address: string; // Nơi cấp
}

export type TPayloadToken = { _id: string; role: string };
export interface IToken {
  token: string;
}

export interface IUser extends IBaseRecord {
  id?: string;
  userId?: string; // 6-24 ký tự
  email?: string;
  pwd?: string; // Mật khẩu cấp 1 (Từ 6 -> 32 ký tự, có ký tự chữ số, chữ hoa và chữ thường)
  companyId?: { _id?: string; name?: string; code?: string } | null; // Bắt buộc với role = Partner
  contact?: IBasicContactInfor;
  gender?: EGENDER;
  birthday?: Date | null;
  identity_key?: IIdentityUser; // căn cước or cmnd
  avatar?: string;
  role?: EUSER_ROLES;
  tokens?: [
    {
      token: string;
    }
  ];
  status?: ERECORD_STATUS;
}

export interface IUpdateUserRequest {
  email?: string;
  companyId?: string;
  contact?: IBasicContactInfor;
  gender?: EGENDER;
  birthday?: Date | null;
  identity_key?: IIdentityUser; // căn cước or cmnd
  avatar?: string;
  role?: EUSER_ROLES;
  status?: ERECORD_STATUS;
}
export interface ICreateUserRequest {
  email?: string;
  companyId?: string;
  contact?: IBasicContactInfor;
  gender?: EGENDER;
  birthday?: Date | null;
  identity_key?: IIdentityUser; // căn cước or cmnd
  avatar?: string;
  role?: EUSER_ROLES;
  status?: ERECORD_STATUS;
}
