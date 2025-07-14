import { IBaseRecord, EPaymentTerms } from "./typeGlobals";

export interface IRepresentative {
  name?: string;
  phone?: string;
}

export interface IContact {
  email?: string;
  hotline?: string | null;
  website?: string | null;
}

export interface IContract {
  startDate?: Date | null;
  endDate?: Date | null;
  paymentTerms?: EPaymentTerms;
}
export interface ISupplier extends IBaseRecord {
  code?: string;
  name?: string;
  taxCode?: string;
  address?: string;
  representative?: IRepresentative;
  contact?: IContact;
  contract?: IContract;
}
