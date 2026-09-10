import QRCode from 'qrcode';

export const generateQRCodeBase64 = async (data: string): Promise<string> => {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
    return qrDataUrl;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error}`);
  }
};

export const buildCanteenQRUrl = (clientUrl: string, slug: string): string => {
  return `${clientUrl}/order?canteen=${slug}`;
};

export const buildAreaQRUrl = (clientUrl: string, slug: string, area: string): string => {
  return `${clientUrl}/order?canteen=${slug}&area=${area}`;
};
