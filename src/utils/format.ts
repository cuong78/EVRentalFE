  import type { ValueType } from 'recharts/types/component/DefaultTooltipContent';
  
  export const formatCurrency = (amount: bigint | ValueType) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(typeof amount === 'bigint' ? amount : Number(amount));
  };