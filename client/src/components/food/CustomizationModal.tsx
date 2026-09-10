import React, { useState } from 'react';
import { FoodItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { X, Check, Sparkles } from 'lucide-react';

interface CustomizationModalProps {
  item: FoodItem;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({ item, isOpen, onClose }) => {
  const { addItem } = useCart();
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (item.customizations) {
      item.customizations.forEach((c) => {
        if (c.options && c.options.length > 0) {
          initial[c.name] = c.options[0];
        }
      });
    }
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [isJainPrep, setIsJainPrep] = useState(false);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSelectOption = (groupName: string, option: string) => {
    setSelectedCustomizations((prev) => ({
      ...prev,
      [groupName]: option,
    }));
  };

  const handleAddToCart = () => {
    const finalCustomizations: Record<string, string> = { ...selectedCustomizations };
    if (isJainPrep) finalCustomizations['Dietary'] = 'Pure Jain Preparation';
    if (notes.trim()) finalCustomizations['Instructions'] = notes.trim();

    addItem(item, quantity, finalCustomizations);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative h-36 bg-gray-100 overflow-hidden">
          <img
            src={item.imageUrl || item.image || '/food/placeholder.webp'}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/food/placeholder.webp';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h2 className="text-xl font-bold leading-tight">{item.name}</h2>
            <p className="text-orange-300 font-bold text-sm">₹{item.price}</p>
          </div>
        </div>

        {/* Customization Options */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {item.jainAvailable && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Jain Preparation
                </div>
                <p className="text-xs text-emerald-700 mt-0.5">Prepared without root vegetables, onion, or garlic.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsJainPrep(!isJainPrep)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  isJainPrep ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                    isJainPrep ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          {item.customizations &&
            item.customizations.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-500">
                  {group.name} {group.required && <span className="text-red-500">*</span>}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {group.options.map((option, oIdx) => {
                    const isSelected = selectedCustomizations[group.name] === option;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(group.name, option)}
                        className={`p-2.5 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/80 text-orange-700 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                        }`}
                      >
                        <span>{option}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

          {/* Kitchen instructions */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500">
              Kitchen Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Extra spicy, less oil, cut into 4 pcs"
              maxLength={100}
              className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between gap-4">
          <div className="flex items-center border border-gray-300 rounded-xl bg-white p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <span className="w-8 text-center font-bold text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-between"
          >
            <span>Add to Order</span>
            <span>₹{item.price * quantity}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
