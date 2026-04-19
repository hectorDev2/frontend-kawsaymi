# Kawsaymi Care - Medication Adherence App

A Next.js web application for tracking medication adherence with patient and caregiver workflows. Built with TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

### For Patients
- **Medication Management**: Add, edit, and track medications with dosage and frequency
- **Adherence Tracking**: Daily medication logs with visual analytics
- **Health Data**: Record blood pressure, blood sugar, weight, and heart rate
- **Caregiver Integration**: Share health data with trusted caregivers and family members
- **Bilingual Support**: Full English and Spanish language support
- **Reminders**: Get notified about upcoming medication doses

### For Caregivers
- **Patient Monitoring**: Track multiple patients' medication adherence
- **Alert System**: Receive alerts for missed doses and low adherence
- **Health Insights**: View patient health trends and medication compliance
- **Secure Communication**: Contact patients directly through the app

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Internationalization**: next-intl
- **Authentication**: Custom JWT-based auth (client-side ready)
- **Charts**: Recharts
- **Forms**: React Hook Form
- **State Management**: React Context + Hooks
- **Icons**: Lucide React

## Project Structure

```
├── app/
│   └── [locale]/
│       ├── (app)/                    # Protected routes
│       │   ├── page.tsx              # Dashboard
│       │   ├── medications/          # Patient medications
│       │   ├── adherence/            # Adherence tracking
│       │   ├── health-data/          # Health metrics
│       │   ├── caregivers/           # Caregiver management
│       │   ├── patients/             # Caregiver patient list
│       │   ├── alerts/               # Caregiver alerts
│       │   └── settings/             # User settings
│       ├── (landing)/
│       │   └── page.tsx              # Landing page
│       ├── auth/
│       │   ├── login/                # Login page
│       │   └── signup/               # Sign up page
│       └── layout.tsx                # Root layout with providers
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── navigation.tsx               # Main navigation
│   ├── medication-card.tsx          # Medication display
│   ├── patient-status-card.tsx      # Patient monitoring
│   ├── adherence-chart.tsx          # Charts
│   └── ...                          # Other components
├── lib/
│   ├── api.ts                       # API client
│   ├── auth-context.tsx             # Authentication context
│   └── utils.ts                     # Utilities
├── middleware.ts                    # i18n routing
├── i18n.ts                          # i18n config
└── messages/
    ├── en.json                      # English translations
    └── es.json                      # Spanish translations
```

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)

### Installation

1. **Clone or download the project**
```bash
cd kawsaymi-care
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Configure these variables:
```env
NEXT_PUBLIC_API_URL=https://kawsaymi-care-backend.onrender.com
NEXT_PUBLIC_USE_MOCK=false
NODE_ENV=development
```

4. **Run the development server**
```bash
pnpm dev
```

Visit `http://localhost:3000` to see the app.

## Project Architecture

### Authentication Flow
1. User logs in with email/password on `/auth/login`
2. AuthProvider calls the backend (`/auth/login`)
3. Access token stored in localStorage (see `lib/api/http.ts`)
4. Protected routes redirect unauthenticated users to login
5. User role (patient/caregiver) determines available routes

### State Management
- **Authentication**: React Context (AuthProvider)
- **UI State**: React Hooks (useState, useCallback)
- **Client Data**: TanStack Query ready (for future backend integration)

### Internationalization
- **Library**: next-intl
- **Languages**: English (en), Spanish (es)
- **URL Structure**: `/en/medications`, `/es/medicamentos`
- **Route Switching**: Language selector in settings
- **Translation Files**: `messages/{locale}.json`

## API Integration

The API client lives in `lib/api/*`.

### Backend Endpoints Used

**Authentication**
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

**Users**
- `GET /users/me`
- `PUT /users/me`
- `PUT /users/me/allergies`
- `PUT /users/me/conditions`
- `DELETE /users/me`

**Medications**
- `GET /medications`
- `GET /medications/:id`
- `POST /medications`
- `PUT /medications/:id`
- `PATCH /medications/:id/status`
- `DELETE /medications/:id`

**Events**
- `GET /events`
- `GET /events/today`
- `GET /events/week`
- `PATCH /events/:id/mark-taken`
- `PATCH /events/:id/mark-missed`

**Adherence**
- `GET /adherence/today`
- `GET /adherence/week`
- `GET /adherence/month`
- `GET /adherence/stats`

**Health**
- `GET /health/profile`
- `POST /health/weight`
- `GET /health/imc`
- `GET /health/polypharmacy`

**Knowledge (RAG)**
- `GET /knowledge/search`
- `POST /knowledge/answer`
- `POST /knowledge/documents` (ADMIN)

## Customization

### Changing Colors
Edit `/app/globals.css` CSS custom properties:
```css
:root {
  --primary: oklch(0.45 0.22 263);  /* Blue */
  --secondary: oklch(0.55 0.18 142);  /* Green */
  /* ... */
}
```

### Adding Languages
1. Create new translation file: `messages/fr.json`
2. Update `i18n.ts` locales array
3. Add to navigation language selector

### Customizing Components
All shadcn/ui components are in `components/ui/`. Modify them freely.

## Deployment

### To Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

```bash
vercel deploy
```

### To Other Platforms
- **Environment**: Node.js 18+
- **Build**: `pnpm build`
- **Start**: `pnpm start`
- **Port**: 3000

## Security Considerations

- JWT tokens stored in httpOnly cookies
- CORS configured for cross-origin requests
- Input validation on all forms
- SQL injection protection via parameterized queries (backend responsibility)
- XSS protection via React's built-in escaping

## Testing

```bash
# Future: Add test scripts
pnpm test
```

## Contributing

Guidelines for contributing:
1. Create feature branches
2. Follow TypeScript best practices
3. Use existing component patterns
4. Update translations for new strings
5. Test on mobile and desktop

## License

All rights reserved - Kawsaymi Care

## Support

For questions or issues, contact support@kawsaymicare.com

## Roadmap

- Real-time notifications
- Offline support with service workers
- Video consultations with doctors
- Integration with health wearables
- Advanced analytics and reporting
- Mobile app (React Native)
