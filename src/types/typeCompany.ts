import { EPaymentTerms, IBaseRecord } from "./typeGlobals";

export interface IRepresentative {
  name: string;
  phone: string;
}

export interface ICompanyContact {
  email: string;
  hotline?: string | null;
  website?: string | null;
}

export interface ICompanyContract {
  startDate: Date | null;
  endDate: Date | null;
  paymentTerms: EPaymentTerms;
}
export enum ECOMPANY_TYPE {
  Carrier = "rrCreies",
  Supplier = "pdsupelir",
  Partner = "rPmersg",
  Customer = "Mrertomr",
}
export interface ICompany extends IBaseRecord {
  code: string; // DHL, FEDEX, GATEWAYEXPRESS,...
  name: string;
  taxCode: string; // Duy nhất
  address: string;
  representative: IRepresentative;
  contact: ICompanyContact;
  contract: ICompanyContract;
  type: ECOMPANY_TYPE | null;
}
