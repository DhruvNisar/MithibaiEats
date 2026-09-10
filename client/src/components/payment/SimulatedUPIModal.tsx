import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { AlertCircle, CheckCircle2, XCircle, ShieldAlert, Timer, Smartphone } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface SimulatedUPIModalProps {
  orderId: string;
  orderNumber: string;
  amount: number;
  isOpen: boolean;
  onSuccess: (orderId: string) => void;
  onCancel: () => void;
}

export const SimulatedUPIModal: React.FC<SimulatedUPIModalProps> = ({
  orderId,
  orderNumber,
  amount,
  isOpen,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentId: string;
    upiQRData: string;
    upiId: string;
  } | null>(null);

  const [timeLeft, setTimeLeft] = useState(300); // 5 mins countdown

  useEffect(() => {
    if (!isOpen) return;

    const initPayment = async () => {
      setLoading(true);
      try {
        const res = await api.post('/payments/create', {
          orderId,
          method: 'upi',
          upiId: 'mithibai-eats@svkm-demo',
        });
        if (res.data.success) {
          setPaymentData({
            paymentId: res.data.data.payment.paymentId,
            upiQRData: res.data.data.upiQRData,
            upiId: res.data.data.upiId,
          });
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to initialize payment.');
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [isOpen, orderId]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSimulateSuccess = async () => {
    if (!paymentData) return;
    setLoading(true);
    try {
      const res = await api.post('/payments/simulate/success', {
        paymentId: paymentData.paymentId,
      });
      if (res.data.success) {
        toast.success('Demo Payment Simulated Successfully!');
        onSuccess(orderId);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to simulate payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateFailure = async () => {
    if (!paymentData) return;
    setLoading(true);
    try {
      await api.post('/payments/simulate/failure', {
        paymentId: paymentData.paymentId,
      });
      toast.error('Payment cancelled / failed (Demo).');
      onCancel();
    } catch {
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-100">
        {/* Urgent Demo Warning Banner */}
        <div className="bg-amber-500 text-black px-4 py-2 text-xs font-black tracking-wide flex items-center justify-center gap-1.5 shadow-inner uppercase">
          <ShieldAlert className="w-4 h-4 text-black" />
          <span>SIMULATED UPI TRANSACTION • TEST DEMO ONLY</span>
        </div>

        <div className="p-6 text-center">
          <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
            <span className="font-medium">Order: <b className="text-gray-900">{orderNumber}</b></span>
            <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
              <Timer className="w-3.5 h-3.5" />
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <div className="mb-2">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Amount Payable</span>
            <div className="text-3xl font-black text-gray-900">₹{amount.toFixed(2)}</div>
          </div>

          {/* QR Code Container */}
          <div className="my-5 p-4 bg-gray-50 rounded-2xl border border-gray-200 inline-block shadow-inner relative">
            {loading || !paymentData ? (
              <div className="w-52 h-52 flex flex-col items-center justify-center text-gray-400 gap-2">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">Generating UPI QR...</span>
              </div>
            ) : (
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <QRCode
                  value={paymentData.upiQRData}
                  size={190}
                  level="H"
                />
              </div>
            )}
            <div className="mt-2 text-[11px] font-mono text-gray-500">
              UPI ID: {paymentData?.upiId || 'mithibai-eats@demo'}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 text-xs text-gray-400 mb-6">
            <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" /> GPay</span>
            <span>•</span>
            <span>PhonePe</span>
            <span>•</span>
            <span>Paytm</span>
            <span>•</span>
            <span>BHIM</span>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-900 mb-6 text-left">
            <p className="font-semibold flex items-center gap-1 mb-0.5">
              <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
              Academic Demo Mode
            </p>
            <p className="text-[11px] text-orange-800">
              In this live sandbox, you can simulate a successful banking transaction without charging any card or account.
            </p>
          </div>

          {/* Action Simulation Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleSimulateSuccess}
              disabled={loading || !paymentData}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simulate Successful UPI Payment
            </button>

            <button
              onClick={handleSimulateFailure}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-xs"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel / Simulate Failure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
