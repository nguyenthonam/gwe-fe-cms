import { ICountry } from "../typeCountry";
import { EGENDER, IIdentityUser } from "../typeUser";

export interface IUpdateProfileRequest {
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
}

export interface IUpdatePasswordRequest {
  pwd: string;
  newPassword: string;
}
