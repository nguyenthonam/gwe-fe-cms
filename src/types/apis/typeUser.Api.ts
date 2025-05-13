import { ERECORD_STATUS } from "@/types/enums";
import { IIdentityUser } from "../typeUser";
import { EGENDER, EUSER_ROLES, IBasicContactInfor } from "../typeGlobals";

export interface ICreateUserRequest {
  email: string;
  pwd?: string;
  fullname?: string;
  company?: string;
  phone?: string;
}
export interface IUpdateUserRequest {
  id: string;
  email?: string;
  company?: string;
  contact?: IBasicContactInfor;
  gender?: EGENDER;
  birthday?: Date;
  identity_key?: IIdentityUser; // căn cước or cmnd
  avatar?: string;
  role?: EUSER_ROLES;
  status?: ERECORD_STATUS;
}

export interface ISearchUserRequest {
  page?: number;
  perPage?: number;
  status?: "all" | ERECORD_STATUS;
  keyword?: string;
}
