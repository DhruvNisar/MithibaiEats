import fs from 'fs';
import path from 'path';

const SRC_DIR = 'C:/Users/Zidane/.gemini/antigravity/scratch/mithibai-eats/client/src';

const files = {
  'pages/student/CanteenMenu.tsx': `import React from 'react';
import { useParams } from 'react-router-dom';

export const CanteenMenu = () => {
  const { id } = useParams();
  
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Menu for {id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="border rounded-2xl p-4 shadow-sm bg-white hover:shadow-md transition">
            <div className="aspect-video bg-gray-200 rounded-xl mb-4"></div>
            <h3 className="font-bold text-lg">Delicious Item {i}</h3>
            <p className="text-gray-500 text-sm mb-2">A very tasty description of the food item.</p>
            <div className="flex justify-between items-center mt-4">
              <span className="font-bold text-orange-500">₹{40 + i * 10}</span>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600">Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};`,

  'pages/student/Checkout.tsx': `import React from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    toast.success('Order placed successfully!');
    clearCart();
    navigate('/order-tracking/12345');
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        {cart.items.map((item, idx) => (
          <div key={idx} className="flex justify-between py-2 border-b last:border-0">
            <span>{item.quantity}x {item.foodItem.name}</span>
            <span>₹{item.subtotal}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold mt-4 pt-4 border-t">
          <span>Total</span>
          <span className="text-orange-500">₹{cart.total}</span>
        </div>
      </div>
      <button 
        onClick={handlePlaceOrder}
        className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition"
      >
        Place Order (Cash on Delivery)
      </button>
    </div>
  );
};`,

  'pages/student/OrderTracking.tsx': `import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

export const OrderTracking = () => {
  const { id } = useParams();
  const steps = ['Order Placed', 'Accepted', 'Preparing', 'Ready'];
  const currentStep = 2; // Preparing

  return (
    <div className="p-8 max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-2">Tracking Order #{id}</h1>
      <p className="text-gray-500 mb-8">Estimated time: 15 mins</p>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        <div className="flex flex-col space-y-6">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white \${index <= currentStep ? 'bg-orange-500' : 'bg-gray-200'}\`}>
                {index + 1}
              </div>
              <div className={\`ml-4 font-medium text-lg \${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}\`}>
                {step}
              </div>
              {index === currentStep && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
                  className="ml-auto bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold"
                >
                  In Progress
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};`,

  'components/cart/CartDrawer.tsx': `import React from 'react';
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
};`,

  'layouts/StudentLayout.tsx': `import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { CartDrawer } from '../components/cart/CartDrawer';
import { useCart } from '../context/CartContext';

export const StudentLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();
  
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-gray-900">
            Mithibai <span className="text-orange-500">Eats</span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link to="/canteens" className="font-medium text-gray-600 hover:text-orange-500">Canteens</Link>
            <Link to="/orders" className="font-medium text-gray-600 hover:text-orange-500">Orders</Link>
            <Link to="/profile" className="font-medium text-gray-600 hover:text-orange-500">Profile</Link>
          </nav>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 bg-orange-50 text-orange-600 rounded-full hover:bg-orange-100 transition"
          >
            🛒
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};`
};

Object.entries(files).forEach(([filepath, content]) => {
  fs.writeFileSync(path.join(SRC_DIR, filepath), content);
});

console.log('Generated more files');
