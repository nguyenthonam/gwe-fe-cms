import { EGENDER, IBasicContactInfor } from "../typeGlobals";
import { IIdentityUser } from "../typeUser";

export interface ICreateOrderRequest {
  email: string;
  pwd?: string;
  fullname?: string;
  company?: string;
  phone?: string;
}

export interface IUpdateOrderRequest {
  contact?: IBasicContactInfor;
  gender?: EGENDER; // giới tính
  birthday?: Date; // Ngày sinh DD/MM/YYYY
  avatar?: string;
  identity_key?: IIdentityUser; // căn cước or cmnd
}
