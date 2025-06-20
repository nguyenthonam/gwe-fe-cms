import { IDimension } from "./typeGlobals";

export interface ISenderData {
  name: string | null; // MR Thuận
  address1: string | null;
  address2: string | null;
  address3: string | null;
  phone: string;
}
export interface IRecipientData {
  name: string | null;
  attention: string | null;
  address1: string | null;
  address2: string | null;
  address3: string | null;
  phone: string;
  country: string | null;
  city: string | null;
  state: string | null;
  postCode: string | null;
}
export interface IPackageData {
  content: string | null;
  code: string | null;
  weight: number;
  PCEs: number;
  declaredValue: string;
  currency: string;
  dimensions: IDimension[] | null;
}
export interface IBillData {
  customer: string; //FOCO
  HAWBCode: string; //GX000000 : Mã vận đơn của công ty mình.
  CAWBCode: string; //xxx00005xxx. Mã vận đơn từ hãng bay
  carrier: string; // DHL SIN
  sender: ISenderData;
  recipient: IRecipientData;
  package: IPackageData;
  note: string | null;
}
