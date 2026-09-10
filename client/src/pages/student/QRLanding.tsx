import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { QrCode, ArrowRight } from 'lucide-react';

export const QRLanding: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canteenSlug = searchParams.get('canteen') || searchParams.get('slug');
  const canteenId = searchParams.get('canteenId') || searchParams.get('id');

  useEffect(() => {
    const resolveCanteen = async () => {
      if (canteenId) {
        navigate(`/canteen/${canteenId}`, { replace: true, state: { fromQR: true } });
        return;
      }

      if (!canteenSlug) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/canteens/slug/${canteenSlug}`);
        if (res.data.success && res.data.data) {
          navigate(`/canteen/${res.data.data._id}`, { replace: true, state: { fromQR: true } });
        } else {
          setError('Canteen not found for this QR code.');
          setLoading(false);
        }
      } catch (err) {
        setError('Invalid or expired QR code.');
        setLoading(false);
      }
    };

    resolveCanteen();
  }, [canteenSlug, canteenId, navigate]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 animate-bounce">
          <QrCode className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Scanning Canteen QR...</h2>
        <p className="text-xs text-gray-500 mt-1">Directing you directly to the floor menu</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
        <QrCode className="w-8 h-8" />
      </div>

      <div>
        <h2 className="text-2xl font-black text-gray-900">QR Code Menu Scan</h2>
        <p className="text-xs text-gray-500 mt-1">
          {error || 'Select your canteen floor to browse the live menu:'}
        </p>
      </div>

      <div className="space-y-3 text-left">
        <Link
          to="/order?canteen=ground"
          className="block p-4 rounded-2xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50/50 transition font-bold text-xs"
        >
          Ground Floor Canteen (Street Food, Juices & Chaat) →
        </Link>
        <Link
          to="/order?canteen=6th"
          className="block p-4 rounded-2xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50/50 transition font-bold text-xs"
        >
          6th Floor Canteen (Thalis, Indo-Chinese & Maggi) →
        </Link>
        <Link
          to="/order?canteen=8th"
          className="block p-4 rounded-2xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50/50 transition font-bold text-xs"
        >
          8th Floor Canteen (Bakery, Gourmet Cafe & Jain Counter) →
        </Link>
      </div>
    </div>
  );
};