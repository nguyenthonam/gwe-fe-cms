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
  // SupperAdmin = "sAdpdine22",
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
  AL = "AL",
  DZ = "DZ",
  AS = "AS",
  AD = "AD",
  AO = "AO",
  AI = "AI",
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
  XB = "XB", // Bonaire (DHL dùng code XB)
  BA = "BA",
  BW = "BW",
  BR = "BR",
  BN = "BN",
  BG = "BG",
  BF = "BF",
  BI = "BI",
  KH = "KH",
  CM = "CM",
  CA = "CA",
  IC = "IC", // Canary Islands
  CV = "CV",
  KY = "KY",
  CF = "CF",
  TD = "TD",
  CL = "CL",
  CN = "CN",
  CO = "CO",
  MP = "MP", // Mariana Islands
  KM = "KM",
  CG = "CG",
  CD = "CD",
  CK = "CK",
  CR = "CR",
  CI = "CI",
  HR = "HR",
  CU = "CU",
  XC = "XC", // Curacao (DHL dùng code XC)
  CY = "CY",
  CZ = "CZ",
  DK = "DK",
  DJ = "DJ",
  DM = "DM",
  DO = "DO",
  EC = "EC",
  EG = "EG",
  SV = "SV",
  ER = "ER",
  EE = "EE",
  SZ = "SZ", // Eswatini (Swaziland)
  ET = "ET",
  FK = "FK",
  FO = "FO",
  FJ = "FJ",
  FI = "FI",
  FR = "FR",
  GF = "GF",
  GA = "GA",
  GM = "GM",
  GE = "GE",
  DE = "DE",
  GH = "GH",
  GI = "GI",
  GR = "GR",
  GL = "GL",
  GD = "GD",
  GP = "GP",
  GU = "GU",
  GT = "GT",
  GG = "GG",
  GN = "GN",
  GW = "GW",
  GQ = "GQ",
  GY = "GY",
  HT = "HT",
  HN = "HN",
  HK = "HK",
  HU = "HU",
  IS = "IS",
  IN = "IN",
  ID = "ID",
  IR = "IR",
  IQ = "IQ",
  IE = "IE",
  IL = "IL",
  IT = "IT",
  JM = "JM",
  JP = "JP",
  JE = "JE",
  JO = "JO",
  KZ = "KZ",
  KE = "KE",
  KI = "KI",
  KR = "KR",
  KP = "KP",
  KV = "KV",
  KW = "KW",
  KG = "KG",
  LA = "LA",
  LV = "LV",
  LB = "LB",
  LS = "LS",
  LR = "LR",
  LY = "LY",
  LI = "LI",
  LT = "LT",
  LU = "LU",
  MO = "MO",
  MG = "MG",
  MW = "MW",
  MY = "MY",
  MV = "MV",
  ML = "ML",
  MT = "MT",
  MH = "MH",
  MQ = "MQ",
  MR = "MR",
  MU = "MU",
  YT = "YT",
  MX = "MX",
  FM = "FM",
  MD = "MD",
  MC = "MC",
  MN = "MN",
  ME = "ME",
  MS = "MS",
  MA = "MA",
  MZ = "MZ",
  MM = "MM",
  NA = "NA",
  NR = "NR",
  NP = "NP",
  NL = "NL",
  XN = "XN", // Nevis (DHL dùng code XN)
  NC = "NC",
  NZ = "NZ",
  NI = "NI",
  NE = "NE",
  NG = "NG",
  NU = "NU",
  MK = "MK",
  NO = "NO",
  OM = "OM",
  PK = "PK",
  PW = "PW",
  PA = "PA",
  PG = "PG",
  PY = "PY",
  PE = "PE",
  PH = "PH",
  PL = "PL",
  PT = "PT",
  PR = "PR",
  QA = "QA",
  RE = "RE",
  RO = "RO",
  RU = "RU",
  RW = "RW",
  SH = "SH",
  WS = "WS",
  SM = "SM",
  ST = "ST",
  SA = "SA",
  SN = "SN",
  RS = "RS",
  SC = "SC",
  SL = "SL",
  SG = "SG",
  SK = "SK",
  SI = "SI",
  SB = "SB",
  XS = "XS", // Somaliland (DHL dùng code XS cho Somalia Hargeisa)
  SO = "SO",
  ZA = "ZA",
  SS = "SS",
  ES = "ES",
  LK = "LK",
  XY = "XY", // St. Barthelemy (DHL dùng code XY)
  XE = "XE", // St. Eustatius (DHL dùng code XE)
  KN = "KN",
  LC = "LC",
  XM = "XM", // St. Maarten (DHL dùng code XM)
  VC = "VC",
  SD = "SD",
  SR = "SR",
  SE = "SE",
  CH = "CH",
  SY = "SY",
  PF = "PF",
  TW = "TW",
  TJ = "TJ",
  TZ = "TZ",
  TH = "TH",
  TL = "TL",
  TG = "TG",
  TO = "TO",
  TT = "TT",
  TN = "TN",
  TR = "TR",
  TM = "TM",
  TC = "TC",
  TV = "TV",
  UG = "UG",
  UA = "UA",
  AE = "AE",
  GB = "GB",
  US = "US",
  UY = "UY",
  UZ = "UZ",
  VU = "VU",
  VA = "VA",
  VE = "VE",
  VN = "VN",
  VG = "VG",
  VI = "VI",
  YE = "YE",
  ZM = "ZM",
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
  volumeWeight: number;
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
