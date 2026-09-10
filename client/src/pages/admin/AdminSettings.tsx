import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Bell, 
  Save, 
  CheckCircle2, 
  Building2, 
  Smartphone, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { Canteen } from '../../types';
import toast from 'react-hot-toast';

export const AdminSettings: React.FC = () => {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCanteenId, setSavingCanteenId] = useState<string | null>(null);

  // Platform general settings
  const [platformFee, setPlatformFee] = useState(2);
  const [packagingFee, setPackagingFee] = useState(5);
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [cashEnabled, setCashEnabled] = useState(true);
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true);
  const [collegeNotice, setCollegeNotice] = useState(
    'Self-pickup only: Please show your order token at the counter once marked READY.'
  );

  useEffect(() => {
    fetchCanteens();
    // Load local storage preferences if any
    const savedNotice = localStorage.getItem('mithibai_notice');
    if (savedNotice) setCollegeNotice(savedNotice);
  }, []);

  const fetchCanteens = async () => {
    try {
      setLoading(true);
      const res = await api.get('/canteens');
      setCanteens(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load canteens');
    } finally {
      setLoading(false);
    }
  };

  const handleCanteenFieldChange = (canteenId: string, field: keyof Canteen, value: any) => {
    setCanteens((prev) =>
      prev.map((c) => (c._id === canteenId ? { ...c, [field]: value } : c))
    );
  };

  const handleSaveCanteen = async (canteen: Canteen) => {
    try {
      setSavingCanteenId(canteen._id);
      await api.put(`/canteens/${canteen._id}`, {
        openingTime: canteen.openingTime,
        closingTime: canteen.closingTime,
        isOpen: canteen.isOpen,
        avgPrepTime: canteen.avgPrepTime,
      });
      toast.success(`Updated settings for ${canteen.name}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update canteen');
    } finally {
      setSavingCanteenId(null);
    }
  };

  const handleSaveGlobal = () => {
    localStorage.setItem('mithibai_notice', collegeNotice);
    toast.success('Campus platform preferences saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Campus Platform Settings</h1>
        <p className="text-sm text-gray-500">
          Configure operating hours, campus fee structures, payment options, and student notifications
        </p>
      </div>

      {/* Canteen Timing & Operations Card */}
      <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
          <Building2 className="h-5 w-5 text-amber-500" />
          Canteen Hours & Live Status (3 Floors)
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-400">Loading canteen configurations...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {canteens.map((canteen) => (
              <div
                key={canteen._id}
                className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                      {canteen.floor}
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <span className="text-xs font-medium text-gray-600">
                        {canteen.isOpen ? 'Accepting Orders' : 'Kitchen Closed'}
                      </span>
                      <input
                        type="checkbox"
                        checked={canteen.isOpen}
                        onChange={(e) =>
                          handleCanteenFieldChange(canteen._id, 'isOpen', e.target.checked)
                        }
                        className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400"
                      />
                    </label>
                  </div>

                  <h3 className="mt-3 font-bold text-gray-900">{canteen.name}</h3>

                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          value={canteen.openingTime || '08:00'}
                          onChange={(e) =>
                            handleCanteenFieldChange(canteen._id, 'openingTime', e.target.value)
                          }
                          className="w-full rounded-xl border border-gray-200 p-2 text-xs font-medium focus:border-amber-500 focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                          Closing Time
                        </label>
                        <input
                          type="time"
                          value={canteen.closingTime || '20:00'}
                          onChange={(e) =>
                            handleCanteenFieldChange(canteen._id, 'closingTime', e.target.value)
                          }
                          className="w-full rounded-xl border border-gray-200 p-2 text-xs font-medium focus:border-amber-500 focus:outline-none bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                        Est. Kitchen Prep Time (Mins)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={canteen.avgPrepTime || 15}
                        onChange={(e) =>
                          handleCanteenFieldChange(
                            canteen._id,
                            'avgPrepTime',
                            parseInt(e.target.value, 10) || 15
                          )
                        }
                        className="w-full rounded-xl border border-gray-200 p-2 text-xs font-medium focus:border-amber-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSaveCanteen(canteen)}
                  disabled={savingCanteenId === canteen._id}
                  className="mt-5 flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 py-2 text-xs font-bold text-white hover:bg-black disabled:opacity-50 transition-colors"
                >
                  <Save className="h-3.5 w-3.5" />
                  {savingCanteenId === canteen._id ? 'Saving...' : 'Save Timing'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Fees & Checkout Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fees */}
        <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            Billing & Packaging Fees
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                College Platform Maintenance Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={platformFee}
                onChange={(e) => setPlatformFee(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-amber-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Applied once per checkout order for college server maintenance
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Eco Packaging & Container Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={packagingFee}
                onChange={(e) => setPackagingFee(parseInt(e.target.value, 10) || 0)}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-amber-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Covers biodegradable takeaway boxes, cups, and paper cutlery
              </p>
            </div>
          </div>
        </div>

        {/* Payment & AI Feature Toggles */}
        <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            <Smartphone className="h-5 w-5 text-blue-500" />
            Payment Methods & Intelligence
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer">
              <div>
                <div className="text-sm font-bold text-gray-900">Simulated UPI Payments (QR Flow)</div>
                <div className="text-xs text-gray-400">Allow instant demo payment via QR scanning</div>
              </div>
              <input
                type="checkbox"
                checked={upiEnabled}
                onChange={(e) => setUpiEnabled(e.target.checked)}
                className="h-5 w-5 rounded text-amber-500 focus:ring-amber-400"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer">
              <div>
                <div className="text-sm font-bold text-gray-900">Pay at Counter (Cash on Pickup)</div>
                <div className="text-xs text-gray-400">Students settle payment directly at the floor counter</div>
              </div>
              <input
                type="checkbox"
                checked={cashEnabled}
                onChange={(e) => setCashEnabled(e.target.checked)}
                className="h-5 w-5 rounded text-amber-500 focus:ring-amber-400"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer">
              <div>
                <div className="text-sm font-bold text-gray-900">Mithibai AI Food Assistant</div>
                <div className="text-xs text-gray-400">Intelligent dish suggestions based on budget and diet</div>
              </div>
              <input
                type="checkbox"
                checked={aiAssistantEnabled}
                onChange={(e) => setAiAssistantEnabled(e.target.checked)}
                className="h-5 w-5 rounded text-amber-500 focus:ring-amber-400"
              />
            </label>
          </div>
        </div>
      </div>

      {/* College Notice Banner */}
      <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
          <Bell className="h-5 w-5 text-purple-500" />
          Campus Notification Banner
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Student Announcement Message
          </label>
          <textarea
            rows={2}
            value={collegeNotice}
            onChange={(e) => setCollegeNotice(e.target.value)}
            className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveGlobal}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-all"
          >
            <CheckCircle2 className="h-4 w-4" /> Save Global Settings
          </button>
        </div>
      </div>
    </div>
  );
};