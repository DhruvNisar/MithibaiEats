import crypto from 'crypto';

// Generate order number in format: MIT-YYYYMMDD-XXXXX
let orderCounter = 1;

export const generateOrderNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const counter = String(orderCounter++).padStart(5, '0');
  return `MIT-${dateStr}-${counter}`;
};

// Reset counter for seeding
export const setOrderCounter = (value: number): void => {
  orderCounter = value;
};

export const generatePaymentId = (): string => {
  return `PAY-${crypto.randomUUID().replace(/-/g, '').substring(0, 12).toUpperCase()}`;
};

export const generateTransactionRef = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TXN';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateEmployeeId = (): string => {
  return `EMP${String(Math.floor(Math.random() * 9000) + 1000)}`;
};

export const generatePickupToken = (): string => {
  return `#MTH-${Math.floor(1000 + Math.random() * 9000)}`;
};

