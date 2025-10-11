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
  VND = "VND", // Vietnam Dong
  USD = "USD", // US Dollar
  EUR = "EUR", // Euro
  GBP = "GBP", // British Pound Sterling
  JPY = "JPY", // Japanese Yen
  CNY = "CNY", // Chinese Yuan
  KRW = "KRW", // South Korean Won
  AUD = "AUD", // Australian Dollar
  CAD = "CAD", // Canadian Dollar
  CHF = "CHF", // Swiss Franc
  SGD = "SGD", // Singapore Dollar
  THB = "THB", // Thai Baht
  INR = "INR", // Indian Rupee
  MYR = "MYR", // Malaysian Ringgit
  IDR = "IDR", // Indonesian Rupiah
  PHP = "PHP", // Philippine Peso
  HKD = "HKD", // Hong Kong Dollar
  AED = "AED", // UAE Dirham
  SAR = "SAR", // Saudi Riyal
  TRY = "TRY", // Turkish Lira
  ZAR = "ZAR", // South African Rand
  SEK = "SEK", // Swedish Krona
  NOK = "NOK", // Norwegian Krone
  DKK = "DKK", // Danish Krone
  NZD = "NZD", // New Zealand Dollar
  BRL = "BRL", // Brazilian Real
  MXN = "MXN", // Mexican Peso
  RUB = "RUB", // Russian Ruble
  PKR = "PKR", // Pakistani Rupee
  EGP = "EGP", // Egyptian Pound
  NGN = "NGN", // Nigerian Naira
  KES = "KES", // Kenyan Shilling
  BDT = "BDT", // Bangladeshi Taka
  LKR = "LKR", // Sri Lankan Rupee
  MMK = "MMK", // Myanmar Kyat
  PLN = "PLN", // Polish Złoty
  CZK = "CZK", // Czech Koruna
  HUF = "HUF", // Hungarian Forint
  RON = "RON", // Romanian Leu
  ARS = "ARS", // Argentine Peso
  BGN = "BGN", // Bulgarian Lev
  CLP = "CLP", // Chilean Peso
  COP = "COP", // Colombian Peso
  HRK = "HRK", // Croatian Kuna
  DOP = "DOP", // Dominican Peso
  FJD = "FJD", // Fiji Dollar
  GHS = "GHS", // Ghanaian Cedi
  ILS = "ILS", // Israeli New Shekel
  JMD = "JMD", // Jamaican Dollar
  JOD = "JOD", // Jordanian Dinar
  KWD = "KWD", // Kuwaiti Dinar
  MAD = "MAD", // Moroccan Dirham
  MOP = "MOP", // Macanese Pataca
  MUR = "MUR", // Mauritian Rupee
  NAD = "NAD", // Namibian Dollar
  PEN = "PEN", // Peruvian Nuevo Sol
  QAR = "QAR", // Qatari Riyal
  RSD = "RSD", // Serbian Dinar
  TWD = "TWD", // Taiwan Dollar
  TZS = "TZS", // Tanzanian Shilling
  UAH = "UAH", // Ukrainian Hryvnia
  UYU = "UYU", // Uruguayan Peso
  VEF = "VEF", // Venezuelan Bolívar
  XAF = "XAF", // Central African CFA Franc
  XOF = "XOF", // West African CFA Franc
  ZMW = "ZMW", // Zambian Kwacha
  ALL = "ALL", // Albanian Lek
  AMD = "AMD", // Armenian Dram
  AZN = "AZN", // Azerbaijani Manat
  BAM = "BAM", // Bosnia-Herzegovina Convertible Mark
  BHD = "BHD", // Bahraini Dinar
  BOB = "BOB", // Bolivian Boliviano
  BYN = "BYN", // Belarusian Ruble
  CRC = "CRC", // Costa Rican Colón
  CUP = "CUP", // Cuban Peso
  DJF = "DJF", // Djiboutian Franc
  DZD = "DZD", // Algerian Dinar
  EEK = "EEK", // Estonian Kroon (hết dùng, EUR thay thế, ghi chú nếu dùng lịch sử)
  GEL = "GEL", // Georgian Lari
  GIP = "GIP", // Gibraltar Pound
  GMD = "GMD", // Gambian Dalasi
  GTQ = "GTQ", // Guatemalan Quetzal
  HNL = "HNL", // Honduran Lempira
  ISK = "ISK", // Icelandic Króna
  KZT = "KZT", // Kazakhstani Tenge
  LAK = "LAK", // Lao Kip
  LSL = "LSL", // Lesotho Loti
  LYD = "LYD", // Libyan Dinar
  MKD = "MKD", // Macedonian Denar
  MNT = "MNT", // Mongolian Tögrög
  MZN = "MZN", // Mozambican Metical
  OMR = "OMR", // Omani Rial
  PAB = "PAB", // Panamanian Balboa
  PGK = "PGK", // Papua New Guinean Kina
  SYP = "SYP", // Syrian Pound
  SZL = "SZL", // Swazi Lilangeni
  TND = "TND", // Tunisian Dinar
  UGX = "UGX", // Ugandan Shilling
  VUV = "VUV", // Vanuatu Vatu
  WST = "WST", // Samoan Tala
  XCD = "XCD", // East Caribbean Dollar
  YER = "YER", // Yemeni Rial
  ZWL = "ZWL", // Zimbabwean Dollar
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
  CA1 = "CA1",
  IC = "IC",
  CV = "CV",
  KY = "KY",
  CF = "CF",
  TD = "TD",
  CL = "CL",
  CN = "CN",
  CN1 = "CN1",
  CN2 = "CN2",
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
  MX1 = "MX1",
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
  US1 = "US1",
  US2 = "US2",
  US3 = "US3",
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
