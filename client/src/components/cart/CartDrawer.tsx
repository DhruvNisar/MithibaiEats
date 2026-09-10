import React from 'react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

export const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { cart, updateQuantity, removeItem } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border p-3 rounded-xl">
                  <div>
                    <h4 className="font-bold">{item.foodItem.name}</h4>
                    <span className="text-orange-500 font-medium">₹{item.foodItem.price}</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
                    <button className="px-2" onClick={() => updateQuantity(item.foodItem._id, item.quantity - 1)}>-</button>
                    <span className="font-medium">{item.quantity}</span>
                    <button className="px-2" onClick={() => updateQuantity(item.foodItem._id, item.quantity + 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {cart.items.length > 0 && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between mb-2"><span className="text-gray-500">Subtotal</span><span className="font-medium">₹{cart.subtotal}</span></div>
            <div className="flex justify-between mb-2"><span className="text-gray-500">Platform Fee</span><span className="font-medium">₹{cart.platformFee}</span></div>
            <div className="flex justify-between mb-4"><span className="text-gray-500">Packaging Fee</span><span className="font-medium">₹{cart.packagingFee}</span></div>
            <div className="flex justify-between font-bold text-xl mb-6"><span>Total</span><span className="text-orange-500">₹{cart.total}</span></div>
            <Link to="/checkout" onClick={onClose} className="block w-full bg-orange-500 text-white text-center py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition">
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};