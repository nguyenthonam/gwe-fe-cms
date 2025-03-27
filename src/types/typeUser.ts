import { ICountry } from "./typeCountry";

export enum EGENDER {
  FEMALE,
  MALE,
}

// NOTE: Căn cước or cmnd
export interface IIdentityUser {
  id: string; // Số cmnd (9 số) hoặc cccd (12 số)
  createAt: string; // Ngày cấp DD/MM/YYYY
  address: string; // Nơi cấp
}

export interface IUser {
  _id?: string;
  userId?: string; // Từ 6 -> 24 ký tự, tên đăng nhập
  company?: string; // Chỉ có nếu user thuộc công ty nào đó. Nếu role = Partner thì chắc chắn phải có company
  email?: string; // email đăng nhập
  phone?: string; // SDT đăng nhập
  fullname?: string; // Họ và tên
  gender?: EGENDER; // giới tính
  birthday?: Date; // Ngày sinh DD/MM/YYYY
  address?: string; // Địa chỉ
  province?: string; // Tỉnh thành phố
  state?: string; // Quận huyện
  country?: ICountry; // Quốc gia
  avatar?: string;
  iCoin?: number;
  nOnline?: number;
  identity_key?: IIdentityUser; // căn cước or cmnd
  role?: string; // Phân quyền
  status?: string; // Trạng thái của tài khoản
}
