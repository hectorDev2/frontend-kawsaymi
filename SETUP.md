# Kawsaymi Care - Setup & Getting Started

## Quick Start

### 1. Start the Development Server
```bash
pnpm dev
```

The app will open at `http://localhost:3000`

### 2. Test the App

**Landing Page**
- Visit `http://localhost:3000/en` to see the welcome page
- You can switch languages using the buttons

**Authentication**
- Click "Get Started" to sign up (creates mock user)
- Or "Sign In" with any credentials (mock authentication)
- Mock users are created in-memory for demo purposes

**Patient View** (signup with role: "Patient")
- Dashboard with quick links to all patient features
- **Medications**: View and mark medications as taken/missed
- **Adherence**: Track adherence trends with charts
- **Health Data**: Log blood pressure, blood sugar, weight, heart rate
- **Caregivers**: Invite and manage caregiver access

**Caregiver View** (signup with role: "Caregiver")
- Dashboard with patient monitoring overview
- **Patients**: List all assigned patients with adherence stats
- **Patient Detail**: Click a patient to see their medications and trends
- **Alerts**: View important alerts about patient adherence
- **Settings**: Manage notification preferences

## Architecture Overview

### Frontend Structure
```
Next.js 16 App Router with localized routes [locale]
├── Landing pages (no auth required)
├── Auth pages (login/signup)
└── Protected app pages (requires authentication)
```

### Key Features Implemented
- ✅ **Bilingual Interface** (English/Spanish with next-intl)
- ✅ **Patient Dashboard** with quick action cards
- ✅ **Medication Tracking** with status indicators
- ✅ **Adherence Analytics** with Recharts visualizations
- ✅ **Health Data Logging** for vital signs
- ✅ **Caregiver Management** with invite system
- ✅ **Patient Monitoring** for caregivers
- ✅ **Alert System** with severity levels
- ✅ **Settings & Profile** management
- ✅ **Mobile Responsive** design with bottom nav on mobile

## Component Hierarchy

### Layout Structure
```
RootLayout (with i18n + AuthProvider)
├── LandingLayout (public)
│   └── Landing page with CTAs
├── AuthLayout (public)
│   ├── Login page
│   └── Signup page
└── AppLayout (protected)
    ├── Navigation (sidebar on desktop, mobile menu)
    ├── Patient routes
    │   ├── Dashboard
    │   ├── Medications
    │   ├── Adherence
    │   ├── Health Data
    │   └── Caregivers
    └── Caregiver routes
        ├── Dashboard
        ├── Patients list
        ├── Patient detail
        ├── Alerts
        └── Settings
```

## Styling System

### Color Scheme
- **Primary** (Blue): `oklch(0.45 0.22 263)` - Main brand color
- **Secondary** (Green): `oklch(0.55 0.18 142)` - Success/positive states
- **Accent**: Orange/warm tones for highlights
- **Destructive** (Red): Error and critical alerts
- **Neutral**: Grays and whites for backgrounds

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Desktop: Fixed sidebar navigation
- Mobile: Sheet-based mobile menu

## Authentication System

### Current Implementation
- **Mock Authentication**: Demonstrates user flow
- **Auth Context**: Global user state management
- **Protected Routes**: Redirect to login if not authenticated
- **Role-Based Access**: Patient vs Caregiver routes

### Switch To Real Backend

Set these env vars in `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://kawsaymi-care-backend.onrender.com
NEXT_PUBLIC_USE_MOCK=false
```

### Backend Integration (Future)
```typescript
// Update lib/api.ts with your backend URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL

// Required endpoints:
POST /auth/login
POST /auth/signup
GET /auth/me
POST /auth/logout
GET /patient/* (patient endpoints)
GET /caregiver/* (caregiver endpoints)
```

## Internationalization

### Adding New Translations
1. Add key to `messages/en.json`
2. Add translation to `messages/es.json`
3. Use in components:
   ```tsx
   const t = useTranslations()
   <p>{t('path.to.key')}</p>
   ```

### Changing Language
- Click language toggle in settings
- Language persists in URL (`/en/...` vs `/es/...`)

## Database Ready (Not Implemented)

The app is structured to connect to a database:
- API client in `lib/api.ts` is ready for backend calls
- Mock data in components can be replaced with API calls
- Use TanStack Query for data fetching (optional)

## Next Steps for Production

1. **Connect Backend API**
   - Update `lib/api.ts` with real endpoints
   - Implement real authentication (JWT, session, etc.)

2. **Add Database**
   - User accounts and roles
   - Medication data
   - Adherence logs
   - Health metrics
   - Caregiver relationships

3. **Enable Features**
   - Push notifications for medication reminders
   - Email notifications
   - SMS alerts for caregivers
   - Real-time data sync

4. **Security Enhancements**
   - HTTPS in production
   - Rate limiting
   - CORS configuration
   - Input validation
   - Session management

5. **Testing**
   - Unit tests for components
   - Integration tests for auth flow
   - E2E tests for user journeys

6. **Monitoring**
   - Error tracking (Sentry)
   - Analytics (Vercel Analytics)
   - Performance monitoring

## Troubleshooting

### Login doesn't work
- The current auth is mock-based for demo purposes
- Any email/password combination works
- Connect a real backend to persist authentication

### Language doesn't change
- Check browser locale settings
- Ensure language toggle is working
- Verify message files exist in `messages/` folder

### Styles look off
- Clear browser cache
- Restart dev server
- Check Tailwind CSS compilation

## File Organization Tips

- Components go in `/components` folder
- Pages go in `/app/[locale]/(app)/` for protected routes
- Utilities in `/lib/` folder
- Assets in `/public/` folder
- Translations in `/messages/` folder

## Key Files to Modify

- `app/[locale]/layout.tsx` - Root layout and metadata
- `lib/auth-context.tsx` - Authentication logic
- `lib/api.ts` - API client configuration
- `messages/{en,es}.json` - Translations
- `app/globals.css` - Design tokens and theming
- `components/navigation.tsx` - Main navigation structure

---

**Ready to build?** Start by connecting your backend API in `lib/api.ts` and the app will be fully functional!
