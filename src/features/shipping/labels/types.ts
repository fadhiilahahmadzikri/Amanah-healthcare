export type ShippingLabelLineItem = {
  id: string;
  name: string;
  quantity: number;
  value: number;
};

export type ShippingLabelData = {
  id: string;
  courier: {
    name: string;
    service: string;
  };
  trackingNumber: string;
  routeCode: string;
  sender: {
    name: string;
    phone: string;
    address: string;
  };
  receiver: {
    name: string;
    phone?: string;
    address: string;
  };
  payment: {
    method: string;
    codAmount: number;
    shippingFee: number;
  };
  package: {
    weightKg: number;
    pieces: number;
    note: string;
  };
  lineItems: ShippingLabelLineItem[];
  codes: {
    qrPayload: string;
    barcodeValue: string;
    qrCodeDataUrl?: string;
    barcodeDataUrl?: string;
  };
};
