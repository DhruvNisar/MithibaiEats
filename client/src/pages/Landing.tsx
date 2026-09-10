import React from 'react';
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
};