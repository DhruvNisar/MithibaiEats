import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Download, 
  Printer, 
  ExternalLink, 
  RefreshCw, 
  Eye, 
  MapPin, 
  Sparkles,
  Layers
} from 'lucide-react';
import api from '../../services/api';
import { QRCode as QRCodeType } from '../../types';
import toast from 'react-hot-toast';

export const AdminQR: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<QRCodeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/qr');
      setQrCodes(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load canteen QR codes');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    try {
      setGenerating(true);
      const res = await api.post('/qr/generate-canteens');
      toast.success(res.data.message || 'Canteen QR codes generated successfully!');
      fetchQRCodes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate QR codes');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (qr: QRCodeType) => {
    const link = document.createElement('a');
    link.href = qr.qrImageData;
    link.download = `mithibai-qr-${qr.canteen?.slug || 'canteen'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded QR Code for ${qr.canteen?.name || qr.label}`);
  };

  const handlePrint = (qr: QRCodeType) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print QR standee');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mithibai Eats - ${qr.canteen?.name} Standee</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              text-align: center;
              padding: 40px 20px;
              color: #111827;
            }
            .card {
              max-width: 480px;
              margin: 0 auto;
              border: 3px solid #d97706;
              border-radius: 24px;
              padding: 36px 24px;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            }
            .logo {
              font-size: 28px;
              font-weight: 900;
              color: #d97706;
              letter-spacing: -0.5px;
            }
            .college {
              font-size: 13px;
              color: #6b7280;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-top: 4px;
            }
            .canteen-name {
              font-size: 24px;
              font-weight: 800;
              margin-top: 24px;
              color: #111827;
            }
            .floor-badge {
              display: inline-block;
              background: #fef3c7;
              color: #92400e;
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 13px;
              font-weight: 700;
              margin-top: 6px;
            }
            .qr-image {
              width: 260px;
              height: 260px;
              margin: 28px auto;
              display: block;
              border-radius: 12px;
              border: 1px solid #e5e7eb;
              padding: 8px;
            }
            .instruction {
              font-size: 16px;
              font-weight: 700;
              color: #1f2937;
            }
            .sub-instruction {
              font-size: 13px;
              color: #6b7280;
              margin-top: 4px;
            }
            .footer {
              margin-top: 24px;
              font-size: 11px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">🍴 Mithibai Eats</div>
            <div class="college">SVKM's Mithibai College, Vile Parle West</div>
            <div class="canteen-name">${qr.canteen?.name}</div>
            <div class="floor-badge">${qr.canteen?.floor}</div>
            <img class="qr-image" src="${qr.qrImageData}" alt="${qr.label} QR Code" />
            <div class="instruction">Scan with any phone camera or Google Lens</div>
            <div class="sub-instruction">Browse 150+ live dishes, order ahead, and pick up without waiting!</div>
            <div class="footer">Self-Pickup Only • Direct Kitchen Queue</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campus Table & Counter QR Codes</h1>
          <p className="text-sm text-gray-500">
            Generate and print official high-resolution scannable QR standees for each canteen
          </p>
        </div>
        <button
          onClick={handleGenerateAll}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Generating...' : 'Regenerate Canteen QRs'}
        </button>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200/70 p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold">Campus Standee Instructions:</span> Print these QR codes and place them on dining tables, notice boards, and counter billing queues. When students scan the QR code, they are directed straight into that floor's live menu with zero login friction.
        </div>
      </div>

      {/* QR Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">Loading canteen QR codes...</div>
      ) : qrCodes.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center border border-gray-100 shadow-sm">
          <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No QR codes generated yet.</p>
          <button
            onClick={handleGenerateAll}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-600"
          >
            Generate Canteen QR Codes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {qrCodes.map((qr) => (
            <div
              key={qr._id}
              className="rounded-3xl bg-white p-6 border border-gray-100 shadow-lg shadow-gray-100 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                    <MapPin className="h-3 w-3" /> {qr.canteen?.floor || 'Campus Floor'}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">
                    {qr.scanCount || 0} scans
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-gray-900">
                  {qr.canteen?.name || qr.label}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {qr.canteen?.description || 'Campus food ordering counter'}
                </p>

                {/* QR Image Container */}
                <div className="mt-5 flex justify-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <img
                    src={qr.qrImageData}
                    alt={qr.label}
                    className="h-48 w-48 object-contain rounded-xl shadow-sm bg-white p-2"
                  />
                </div>

                {/* Direct Link */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-gray-50 p-2 text-xs text-gray-500">
                  <span className="truncate pr-2 font-mono">
                    {window.location.origin}/canteen/{qr.canteen?._id}
                  </span>
                  <a
                    href={`/canteen/${qr.canteen?._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-600 hover:text-amber-700 font-bold shrink-0"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownload(qr)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download PNG
                </button>
                <button
                  onClick={() => handlePrint(qr)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Standee
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};