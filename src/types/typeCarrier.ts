import { ECHARGEABLE_WEIGHT_TYPE, IBaseRecord } from "./typeGlobals";

export interface ICarrier extends IBaseRecord {
  companyId?: { _id?: string; name?: string; code?: string; type?: string } | string | null;
  name: string;
  code: string; // DHLVN, DHLSG, FEDEXVN,...
  chargeableWeightType: ECHARGEABLE_WEIGHT_TYPE;
}
