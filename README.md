# Sevakro - Nursing Care Booking System

A high-fidelity, mobile-first responsive web application for booking professional nursing care services. Built with React, TypeScript, and Tailwind CSS.

## 🏗️ Architecture Overview

### Frontend Components

```
frontend/
├── src/
│   ├── contexts/              # Global state management
│   │   ├── ThemeContext.tsx   # Theme & admin settings
│   │   └── UserContext.tsx    # User & family profiles
│   ├── components/            # React components
│   │   ├── MobileHeader.tsx   # Dynamic header with location & profiles
│   │   ├── ServiceCard.tsx    # Individual service card
│   │   ├── ServicesGrid.tsx   # 3-column service grid
│   │   ├── BottomNavigation.tsx # Mobile bottom nav
│   │   └── BookingModal.tsx   # Booking form modal
│   └── pages/
│       └── UserAppPage.tsx    # Main app entry point
```

## 📱 User App Features

### Mobile Header (Dynamic)
- **Location Selector**: Displays current city/state with map pin icon
- **Points Counter**: Shows user loyalty points (₹100)
- **Family Member Dropdown**: Switch between profiles (Self, Father, Mother, etc.)
- **User Avatar**: Opens account menu
- **Dynamic Gradient**: Background colors controlled by Admin Panel

### Services Grid
- **3-Column Layout**: Responsive card grid for mobile/desktop
- **Service Cards**:
  - High-quality emoji icons representing services
  - Star rating (4.6-4.9) with review count
  - Service name and description
  - Current price with crossed-out original price
  - "Book Now" button

### Available Services
- 💊 **Medication Management** - ₹299 (was ₹399)
- 🩹 **Post-Op Wound Care** - ₹399 (was ₹549)
- 💉 **IV Drip Administration** - ₹599 (was ₹799)
- 👴 **Elderly Companionship** - ₹199 (was ₹299)
- 🩺 **Blood Pressure Check** - ₹99 (was ₹149)
- 🌡️ **Temperature & Glucose** - ₹149 (was ₹199)

### Bottom Navigation
- Standard mobile navigation with 3 tabs
- Home (selected), Bookings, Profiles
- Dynamic gradient applied to active tab

### Booking Modal
- Service summary card
- Date picker (minimum today)
- Time selector
- Profile information display
- Additional notes textarea
- Confirm/Cancel buttons
- Loading state handling

## 🎨 Theme Customization

### ThemeContext
Manages global theme settings:
```typescript
{
  primaryThemeGradientStart: "#667eea",
  primaryThemeGradientEnd: "#764ba2",
  bookingRadiusKm: 2
}
```

Fetches from: `GET /api/admin/settings/theme`

## 👥 User Management

### UserContext
Manages user state:
- User ID and authentication
- Current location (city, state)
- Loyalty points
- Selected family profile
- List of all family profiles

Fetches from: `GET /api/user/profiles`

### FamilyProfile Model
```typescript
{
  id: string
  profileName: string    // "Self", "Father", "Mother"
  relation: string       // relationship type
  medicalHistoryUrl?: string
  allergies?: string
  dateOfBirth?: string
}
```

## 🔌 API Integration Points

### Services API
- `GET /api/services` - Fetch all services
- `POST /api/services` - Create service (Admin)
- `PUT /api/services/:id` - Update service (Admin)
- `DELETE /api/services/:id` - Delete service (Admin)

### User Profiles API
- `GET /api/user/profiles` - Fetch user's family profiles
- `POST /api/user/profiles` - Create new family profile
- `PUT /api/user/profiles/:id` - Update profile (Admin)

### Admin Settings API
- `GET /api/admin/settings/theme` - Fetch theme settings
- `PUT /api/admin/settings/theme` - Update theme colors and radius

### Bookings API
- `POST /api/bookings` - Create new booking
  ```typescript
  {
    serviceId: string
    familyProfileId: string
    date: string          // YYYY-MM-DD
    time: string          // HH:mm
    notes: string
  }
  ```

## 🛠️ Installation & Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
```env
VITE_API_URL=http://localhost:5000/api
```

### Build for Production
```bash
npm run build
npm run preview
```

## 📋 Backend Schema Requirements

### Required Models

#### Service.js
```javascript
{
  _id: ObjectId,
  name: string,
  description: string,
  price: number,
  originalPrice: number,
  rating: number,
  reviewCount: number,
  iconUrl: string,
  status: 'active' | 'inactive',
  createdAt: Date,
  updatedAt: Date
}
```

#### FamilyProfile.js
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  profileName: string,
  relation: string,
  medicalHistoryUrl: string,
  allergies: string,
  dateOfBirth: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### AdminSettings.js
```javascript
{
  _id: ObjectId,
  bookingRadiusKm: number,
  primaryThemeGradientStart: string,
  primaryThemeGradientEnd: string,
  updatedAt: Date
}
```

#### Booking.js
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  serviceId: ObjectId,
  familyProfileId: ObjectId,
  date: Date,
  time: string,
  notes: string,
  status: 'pending' | 'accepted' | 'completed' | 'cancelled',
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Next Phase Features

### Admin Panel Interface
- Desktop-focused dashboard with sidebar navigation
- Service CRUD management table
- Theme color picker with live preview
- Dispatch radius configuration
- User/Nurse management

### Nurse Notification UI
- Real-time booking notifications with non-stop vibration
- Accept/Reject buttons
- Patient profile and location display
- Integration with PWA service worker

### PWA & Push Notifications
- `frontend/public/service-worker.js` - Background push handling
- `frontend/public/manifest.json` - PWA configuration
- `navigator.vibrate()` API integration
- Backend Socket.IO for real-time updates

## 📦 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **UI Feedback**: React Hot Toast
- **Styling**: Tailwind CSS with dynamic gradients

## 🔐 Security Considerations

- API requests include user context via headers
- Family profile selection tied to user ID
- Admin settings protected (should require authentication)
- Booking data validated on backend

## 📝 Notes

- All service cards use emoji icons for quick visual identification
- Responsive design tested on mobile (max-width: 768px)
- Theme colors apply to header and navigation gradient
- Booking data persists with selected family profile ID
- Demo services included for development/testing
