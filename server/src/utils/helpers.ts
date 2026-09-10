export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const isCanteenOpen = (openingTime: string, closingTime: string): boolean => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = openingTime.split(':').map(Number);
  const [closeH, closeM] = closingTime.split(':').map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};

export const getTimeOfDay = (): 'morning' | 'lunch' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 20) return 'evening';
  return 'night';
};

export const paginate = (page: number, limit: number): { skip: number; limit: number } => {
  const safeLimit = Math.min(Math.max(limit, 1), 1000);
  const safePage = Math.max(page, 1);
  return { skip: (safePage - 1) * safeLimit, limit: safeLimit };
};

export const asyncHandler = <T>(
  fn: (...args: T[]) => Promise<unknown>
) => {
  return (...args: T[]): Promise<unknown> => {
    return Promise.resolve(fn(...args)).catch(args[2] as unknown as (err: unknown) => void);
  };
};
