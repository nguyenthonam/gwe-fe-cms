import { ERECORD_STATUS } from "@/types/enums";
import { EGENDER, EUSER_ROLES, IIdentityUser } from "../typeUser";
import { ICountry } from "../typeCountry";

export interface ICreateUserRequest {
  email: string;
  pwd: string;
  fullname?: string;
  company?: string;
  phone?: string;
}
export interface IUpdateUserRequest {
  id: string;
  email?: string;
  company?: string;
  phone?: string; // SDT đăng nhập
  fullname?: string; // Họ và tên
  gender?: EGENDER; // giới tính
  birthday?: Date; // Ngày sinh DD/MM/YYYY
  address?: string; // Địa chỉ
  province?: string; // Tỉnh thành phố
  state?: string; // Quận huyện
  country?: ICountry; // Quốc gia
  avatar?: string;
  identity_key?: IIdentityUser; // căn cước or cmnd
  role?: EUSER_ROLES; // Phân quyền
  status?: ERECORD_STATUS;
}

export interface ISearchUserRequest {
  page?: number;
  perPage?: number;
  status?: "all" | ERECORD_STATUS;
  keyword?: string;
}
