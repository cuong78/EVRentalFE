# EV Rental - Frontend Application

Ứng dụng quản lý cho thuê xe điện (Electric Vehicle Rental) được xây dựng với React, TypeScript và Vite.

## 🚀 Công Nghệ Sử Dụng

### Core Framework & Build Tools
- **React** `^18.3.1` - Thư viện UI component-based
- **TypeScript** `~5.8.3` - Ngôn ngữ lập trình type-safe
- **Vite** `^6.3.5` - Build tool và dev server hiện đại, nhanh

### UI Component Libraries
- **Material-UI (MUI)** `^7.1.0` - Thư viện component chính
  - `@mui/material` - Core components
  - `@mui/x-data-grid` `^7.27.0` - Data grid với tính năng nâng cao
  - `@mui/x-date-pickers` `^7.22.2` - Date/time pickers
  - `@mui/icons-material` `^6.2.0` - Icon library
- **Ant Design** `^5.26.2` - Thư viện component bổ sung
- **Styled Components** `^6.1.15` - CSS-in-JS styling
- **Emotion** `^11.14.0` - CSS-in-JS engine cho MUI

### Styling & CSS
- **Tailwind CSS** `^4.1.7` - Utility-first CSS framework
- **PostCSS** `^8.5.1` - CSS post-processing
- **Autoprefixer** `^10.4.20` - Tự động thêm vendor prefixes

### State Management & Data Fetching
- **React Context API** - Global state management
- **Axios** `^1.9.0` - HTTP client với interceptors
- **Custom Hooks** - Tái sử dụng logic (useAuth, useVehicle, useDashboard...)

### Form Management
- **React Hook Form** `^7.56.4` - Form validation và state management
- **Yup** `^1.6.2` - Schema validation cho forms

### Real-time Communication
- **SockJS Client** `^1.6.1` - WebSocket fallback protocol
- **@stomp/stompjs** `^7.0.0` - STOMP over WebSocket
- Real-time dashboard updates và notifications

### Authentication & Authorization
- **JWT Tokens** - Access & refresh token authentication
- **Firebase** `^11.9.1` - Google OAuth integration
- **Auto Token Refresh** - Tự động làm mới token 5 phút trước expiry
- **Protected Routes** - Route guards dựa trên roles/permissions

### Data Visualization & Charts
- **Recharts** `^2.15.3` - React charts library
- **Nivo Charts** `^0.87.0` - Advanced data visualization
- Dashboard analytics với real-time updates

### File Handling & Media
- **Cloudinary** `^1.14.3` - Image hosting và optimization
- **React Dropzone** `^14.3.5` - Drag & drop file upload
- **File Saver** `^2.0.5` - Client-side file downloads
- **PDF-lib** `^1.17.1` - PDF generation và manipulation
- **Canvas** `^1.0.2` - Canvas API cho PDF rendering

### Date & Time
- **Day.js** `^1.11.13` - Date manipulation library (lightweight)
- **MUI X Date Pickers** - Date/time selection components

### Routing
- **React Router DOM** `^7.5.0` - Client-side routing
- Nested routes, protected routes, dynamic routes

### Code Quality & Linting
- **ESLint** `^9.18.0` - Code linting
  - `eslint-plugin-react-hooks` - React hooks rules
  - `eslint-plugin-react-refresh` - Fast refresh compatibility
  - `@typescript-eslint/eslint-plugin` - TypeScript linting
- **TypeScript ESLint** `^8.19.1` - TypeScript parser cho ESLint
- **Globals** `^15.14.0` - Global variables definition

### Development Tools
- **Vite Plugin React SWC** `^3.8.3` - Fast refresh với SWC
- **@types packages** - TypeScript type definitions
  - `@types/react` `^19.0.6`
  - `@types/react-dom` `^19.0.4`
  - `@types/node` - Node.js types

## 📁 Cấu Trúc Dự Án

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common components (Alert, Toast, Popup...)
│   ├── debug/          # Development debugging tools
│   └── ui/             # Feature-specific UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── layouts/            # Layout components
├── pages/              # Page components (routing)
│   ├── admin/          # Admin dashboard pages
│   ├── auth/           # Authentication pages
│   ├── booking/        # Booking management
│   ├── staff/          # Staff portal
│   └── ...
├── service/            # API service layer
│   ├── api.ts          # Axios instance với interceptors
│   ├── authService.ts  # Authentication APIs
│   ├── vehicleService.ts
│   └── ...
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── constants/          # Constants và configuration

## 🛠️ Installation & Setup

### Prerequisites
- Node.js >= 16.x
- npm hoặc yarn

### Cài Đặt

```bash
# Clone repository
git clone <repository-url>
cd EVRentalFE

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

### Environment Variables
Tạo file `.env` trong thư mục root:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

### Development Server
- Frontend: `http://localhost:3000`
- Backend API Proxy: `http://localhost:8080` (configured trong vite.config.ts)

## ✨ Tính Năng Chính

### 1. Authentication & Authorization
- Đăng nhập/đăng ký với email/password
- Google OAuth integration
- JWT token-based authentication
- Auto token refresh
- Role-based access control (Admin, Staff, User)
- Protected routes với permission checking

### 2. Vehicle Management
- Browse available vehicles
- Search và filter vehicles
- Vehicle details với images
- Real-time availability status
- Admin vehicle CRUD operations

### 3. Booking System
- Tạo booking mới
- Xem chi tiết booking
- Quản lý booking status
- Invoice generation
- Payment integration (VNPay)

### 4. Staff Portal
- Document upload và verification
- KYC (Know Your Customer) extraction từ CCCD
- Booking management
- Document approval workflow

### 5. Admin Dashboard
- Real-time statistics với WebSocket
- Revenue analytics
- Vehicle performance metrics
- User management
- Station management
- QR code generation

### 6. Payment Integration
- VNPay payment gateway
- Wallet topup functionality
- Payment history tracking
- Transaction management

### 7. Real-time Features
- Live dashboard updates qua WebSocket
- Real-time notifications
- Booking status changes
- Vehicle availability updates

## 🔌 API Integration

### Base Configuration
- Base URL: Configured trong `src/constants/api.ts`
- API Instance: `src/service/api.ts` với Axios interceptors
- Auto token refresh: Response interceptor xử lý 401 errors

### Authentication Flow
1. Login request → Nhận access token và refresh token
2. Token lưu trong localStorage
3. Request interceptor tự động thêm token vào headers
4. Response interceptor bắt 401 → Tự động refresh token
5. Retry failed request với token mới

### WebSocket Connection
- Protocol: STOMP over SockJS
- Topics: Dashboard statistics, notifications
- Auto-reconnect khi mất kết nối

## 🎨 UI/UX Features

### Material-UI Theming
- Custom theme configuration
- Dark/light mode support (nếu implemented)
- Responsive design với breakpoints

### Tailwind CSS
- Utility-first styling
- Custom configuration trong `tailwind.config.js`
- Responsive utilities

### Component Patterns
- Compound components
- Render props
- Custom hooks
- Context providers

## 🔒 Security Features

### Token Management
- Secure token storage trong localStorage
- Auto token expiration handling
- Refresh token rotation
- Token validation trước mỗi request

### Protected Routes
- Route guards với ProtectedRoute component
- Role-based rendering
- Permission checking

### API Security
- CORS configuration
- Request/response interceptors
- Error handling và logging

## 🐛 Debugging

### Common Issues

**"No token found, clearing user"**
- Kiểm tra localStorage key 'token'
- Verify login flow hoàn tất
- Check token expiration

**"Failed to fetch stations" (400 error)**
- Kiểm tra backend đang chạy
- Verify API base URL trong constants
- Check Network tab để xem request payload

**WebSocket connection issues**
- Verify backend WebSocket endpoint
- Check STOMP configuration
- Ensure backend supports SockJS

### Development Tools
- React DevTools - Component tree inspection
- Redux DevTools (nếu sử dụng Redux)
- Network tab - API request monitoring
- Console logs - Error tracking

## 📝 Code Style

### TypeScript
- Strict type checking enabled
- Interface definitions trong `src/types/`
- Explicit return types cho functions

### React Best Practices
- Functional components với hooks
- Custom hooks cho reusable logic
- Context API cho global state
- Proper dependency arrays cho useEffect

### Naming Conventions
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Hooks: camelCase với prefix 'use' (e.g., `useAuth.ts`)
- Services: camelCase (e.g., `authService.ts`)
- Constants: UPPER_SNAKE_CASE

## 🚢 Deployment

### Build Production

```bash
npm run build
```

Output trong thư mục `dist/`

### Environment Configuration
- Development: `.env.development`
- Production: `.env.production`
- Staging: `.env.staging`

### Deployment Platforms
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- Docker containerization

## 📦 Package Scripts

```json
{
  "dev": "vite",                    // Start dev server
  "build": "tsc -b && vite build", // Build production
  "lint": "eslint .",              // Run linting
  "preview": "vite preview"        // Preview production build
}
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

[License Type] - See LICENSE file for details

## 👥 Team

[Team information]

## 📞 Contact

[Contact information]
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
