import fs from 'fs';
import path from 'path';

const SRC_DIR = 'C:/Users/Zidane/.gemini/antigravity/scratch/mithibai-eats/client/src';

const dirs = [
  'components/ui',
  'components/layout',
  'components/food',
  'components/cart',
  'components/order',
  'components/payment',
  'components/ai',
  'components/admin',
  'components/qr',
  'pages/auth',
  'pages/student',
  'pages/staff',
  'pages/admin',
  'layouts',
  'utils',
  'hooks'
];

dirs.forEach(dir => {
  fs.mkdirSync(path.join(SRC_DIR, dir), { recursive: true });
});

const files = {
  'utils/formatters.ts': `export const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
export const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });`,

  'hooks/useDebounce.ts': `import { useState, useEffect } from 'react';
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}`,

  'components/ui/Button.tsx': `import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-orange-500 text-white hover:bg-orange-600': variant === 'primary',
            'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
            'border border-gray-200 bg-white hover:bg-gray-100 text-gray-900': variant === 'outline',
            'hover:bg-gray-100 text-gray-900': variant === 'ghost',
            'h-9 px-4 text-sm': size === 'sm',
            'h-11 px-6 text-base': size === 'md',
            'h-14 px-8 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';`,

  'pages/Landing.tsx': `import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8"
        >
          Mithibai <span className="text-orange-500">Eats</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto mb-10"
        >
          Your Campus. Your Food. Your Way. <br/>
          Skip the queue. Order from your campus canteen.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4"
        >
          <Link to="/canteens">
            <Button size="lg" className="shadow-lg shadow-orange-500/30">ORDER NOW</Button>
          </Link>
          <Link to="/qr">
            <Button size="lg" variant="outline">SCAN QR</Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};`,
};

Object.entries(files).forEach(([filepath, content]) => {
  fs.writeFileSync(path.join(SRC_DIR, filepath), content);
});

console.log('Generated base files');
