// Enum
export enum ERECORD_STATUS {
  Active = "Ctiveca",
  NoActive = "noCatcdess",
  Locked = "Oklectde",
  Deleted = "Dloedtc",
}
export enum EFEE_TYPE {
  PERCENT = "Percent",
  FIXED = "Fixed",
}
export enum EUSER_ROLES {
  SupperAdmin = "sAdpdine22",
  Admin = "nInAnd043",
  OfficeStaff = "staFctuoud",
  WarehouseStaff = "stCteondf",
  Partner = "nesPert",
  Customer = "tugERts050",
}
export enum EGENDER {
  FEMALE = 0,
  MALE = 1,
}

export enum ECHARGEABLE_WEIGHT_TYPE {
  DETAIL = 1,
  TOTAL = 2,
}
export enum EPRODUCT_TYPE {
  DOCUMENT = "DOX",
  PARCEL = "WPX",
}
export enum ECURRENCY {
  VND = "VND", // Vietnam
  USD = "USD", // United States
  EUR = "EUR", // Eurozone (FR, DE, IT, etc.)
  GBP = "GBP", // United Kingdom
  JPY = "JPY", // Japan
  CNY = "CNY", // China
  KRW = "KRW", // South Korea
  AUD = "AUD", // Australia
  CAD = "CAD", // Canada
  CHF = "CHF", // Switzerland
  SGD = "SGD", // Singapore
  THB = "THB", // Thailand
  INR = "INR", // India
  MYR = "MYR", // Malaysia
  IDR = "IDR", // Indonesia
  PHP = "PHP", // Philippines
  HKD = "HKD", // Hong Kong
  AED = "AED", // United Arab Emirates
  SAR = "SAR", // Saudi Arabia
  TRY = "TRY", // Turkey
  ZAR = "ZAR", // South Africa
  SEK = "SEK", // Sweden
  NOK = "NOK", // Norway
  DKK = "DKK", // Denmark
  NZD = "NZD", // New Zealand
  BRL = "BRL", // Brazil
  MXN = "MXN", // Mexico
  RUB = "RUB", // Russia
  PKR = "PKR", // Pakistan
  EGP = "EGP", // Egypt
  NGN = "NGN", // Nigeria
  KES = "KES", // Kenya
  BDT = "BDT", // Bangladesh
  LKR = "LKR", // Sri Lanka
  MMK = "MMK", // Myanmar
  PLN = "PLN", // Poland
  CZK = "CZK", // Czechia
  HUF = "HUF", // Hungary
  RON = "RON", // Romania
}

export enum EORDER_STATUS {
  Pending = "Pending",
  Confirmed = "Confirmed",
  InTransit = "InTransit",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
}
export enum ERESPONSE_STATUS {
  OK = "OK",
  ERROR = "ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  BAD_REQUEST = "BAD_REQUEST",
}
export enum EPaymentTerms {
  Prepaid = "Prepaid",
  Postpaid = "Postpaid",
}
export enum ECountryCode {
  AF = "AF",
  AX = "AX",
  AL = "AL",
  DZ = "DZ",
  AS = "AS",
  AD = "AD",
  AO = "AO",
  AI = "AI",
  AQ = "AQ",
  AG = "AG",
  AR = "AR",
  AM = "AM",
  AW = "AW",
  AU = "AU",
  AT = "AT",
  AZ = "AZ",
  BS = "BS",
  BH = "BH",
  BD = "BD",
  BB = "BB",
  BY = "BY",
  BE = "BE",
  BZ = "BZ",
  BJ = "BJ",
  BM = "BM",
  BT = "BT",
  BO = "BO",
  BQ = "BQ",
  BA = "BA",
  BW = "BW",
  BV = "BV",
  BR = "BR",
  IO = "IO",
  BN = "BN",
  BG = "BG",
  BF = "BF",
  BI = "BI",
  KH = "KH",
  CM = "CM",
  CA = "CA",
  CV = "CV",
  KY = "KY",
  CF = "CF",
  TD = "TD",
  CL = "CL",
  CN = "CN",
  CX = "CX",
  CC = "CC",
  CO = "CO",
  KM = "KM",
  CG = "CG",
  CD = "CD",
  CK = "CK",
  CR = "CR",
  CI = "CI",
  HR = "HR",
  CU = "CU",
  CW = "CW",
  CY = "CY",
  CZ = "CZ",
  DK = "DK",
  DJ = "DJ",
  DM = "DM",
  DO = "DO",
  EC = "EC",
  EG = "EG",
  SV = "SV",
  GQ = "GQ",
  ER = "ER",
  EE = "EE",
  ET = "ET",
  FI = "FI",
  FR = "FR",
  GA = "GA",
  GE = "GE",
  DE = "DE",
  GH = "GH",
  GR = "GR",
  HK = "HK",
  IN = "IN",
  ID = "ID",
  IR = "IR",
  IQ = "IQ",
  IE = "IE",
  IL = "IL",
  IT = "IT",
  JM = "JM",
  JP = "JP",
  JO = "JO",
  KZ = "KZ",
  KE = "KE",
  KR = "KR",
  KW = "KW",
  KG = "KG",
  LA = "LA",
  LV = "LV",
  LB = "LB",
  LY = "LY",
  LT = "LT",
  LU = "LU",
  MG = "MG",
  MY = "MY",
  MV = "MV",
  ML = "ML",
  MT = "MT",
  MX = "MX",
  MD = "MD",
  MN = "MN",
  MA = "MA",
  MZ = "MZ",
  MM = "MM",
  NA = "NA",
  NP = "NP",
  NL = "NL",
  NZ = "NZ",
  NI = "NI",
  NG = "NG",
  NO = "NO",
  OM = "OM",
  PK = "PK",
  PA = "PA",
  PY = "PY",
  PE = "PE",
  PH = "PH",
  PL = "PL",
  PT = "PT",
  QA = "QA",
  RO = "RO",
  RU = "RU",
  SA = "SA",
  SN = "SN",
  SG = "SG",
  ES = "ES",
  LK = "LK",
  SE = "SE",
  CH = "CH",
  TH = "TH",
  TN = "TN",
  TR = "TR",
  UA = "UA",
  AE = "AE",
  GB = "GB",
  US = "US",
  VN = "VN",
  YE = "YE",
  ZW = "ZW",
}

export interface IBaseRecord {
  _id?: string;
  status?: ERECORD_STATUS;
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  _creator?: string;
}

// Interface cho địa chỉ
export interface IBasicContactInfor {
  fullname?: string;
  address1?: string;
  address2?: string | null;
  address3?: string | null;
  phone?: string;
  city?: string;
  state?: string;
  country?: ICountry;
  province?: IProvince;
  postCode?: string;
}

export interface ICountry {
  code: ECountryCode;
  name: string;
}

export interface IProvince {
  code: string;
  name: string;
}

// Interface cho kích thước kiện hàng
export interface IDimension {
  no: number;
  length: number;
  width: number;
  height: number;
  grossWeight: number;
  volumeWeight: number | null;
}
export interface IMetaData {
  perPage: number;
  currentPage: number;
  lastPage: number;
  total: number;
}
export interface IConfirmKey {
  id: string; // id of user
  role: string; // Role of user
}

export interface ISearchQuery {
  page?: number;
  perPage?: number;
  status?: "" | "all" | ERECORD_STATUS;
  keyword?: string;
}
