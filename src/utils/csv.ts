export const exportToCSV = (data: {}[] | { totalRevenue: number; totalExpense: number; netProfit: number; }[], filename: string) => {
  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const csvContent = BOM + Object.keys(data[0]).join(",") + "\n"
    + data.map((row: { [s: string]: unknown; } | ArrayLike<unknown>) => Object.values(row).join(",")).join("\n");
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Hàm xử lý encoding UTF-8 cho CSV với tiếng Việt
export const processCSVEncoding = async (blob: Blob): Promise<Blob> => {
  try {
    // Đọc blob thành ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // BOM UTF-8: EF BB BF
    const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
    
    // Kiểm tra xem đã có BOM chưa
    let hasBOM = false;
    if (uint8Array.length >= 3) {
      hasBOM = uint8Array[0] === BOM[0] && 
               uint8Array[1] === BOM[1] && 
               uint8Array[2] === BOM[2];
    }
    
    if (hasBOM) {
      // Đã có BOM, trả về blob gốc với type đúng
      return new Blob([arrayBuffer], { type: 'text/csv;charset=utf-8' });
    } else {
      // Chưa có BOM, thêm vào
      const newArray = new Uint8Array(BOM.length + uint8Array.length);
      newArray.set(BOM, 0);
      newArray.set(uint8Array, BOM.length);
      return new Blob([newArray], { type: 'text/csv;charset=utf-8' });
    }
  } catch (error) {
    console.error('Error processing CSV encoding:', error);
    // Trả về blob gốc nếu có lỗi
    return blob;
  }
};

// Hàm tạo tên file tiếng Việt an toàn
export const createSafeVietnameseFilename = (baseName: string, extension: string): string => {
  // Loại bỏ các ký tự không hợp lệ trong tên file
  const safeName = baseName
    .replace(/[<>:"/\\|?*]/g, '') // Loại bỏ ký tự không hợp lệ
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .normalize('NFD') // Chuẩn hóa Unicode
    .replace(/[\u0300-\u036f]/g, ''); // Loại bỏ dấu tiếng Việt
  
  return `${safeName}.${extension}`;
};

 