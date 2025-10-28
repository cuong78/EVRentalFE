  import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
  
  export const formatCurrency = (amount: bigint | ValueType) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(typeof amount === 'bigint' ? amount : Number(amount));
  };

  export const formatNumberVN = (value: number | string | bigint | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    if (typeof value === 'number') return new Intl.NumberFormat('vi-VN').format(value);
    if (typeof value === 'bigint') return new Intl.NumberFormat('vi-VN').format(Number(value));
    const digitsOnly = String(value).replace(/[^\d-]/g, '');
    const num = digitsOnly.length ? Number(digitsOnly) : 0;
    return new Intl.NumberFormat('vi-VN').format(num);
  };