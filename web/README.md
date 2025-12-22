# Echo Web Application

## Overview
Web application for Echo - Your Social Audio Journal built with Next.js 14, TypeScript, and Tailwind CSS.

## Features
- ✅ User authentication (login/register)
- ✅ Audio recording directly in browser
- ✅ Dashboard with recent entries
- ✅ Responsive design
- ✅ Real-time updates with React Query
- ✅ Beautiful UI with Tailwind CSS

## Tech Stack
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running on localhost:3000

### Installation

```bash
# Install dependencies
cd web
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open http://localhost:3001 in your browser.

## Project Structure

```
web/
├── src/
│   ├── pages/
│   │   ├── _app.tsx          # App wrapper
│   │   ├── _document.tsx     # Document wrapper
│   │   ├── index.tsx          # Landing page
│   │   ├── login.tsx          # Login page
│   │   ├── register.tsx       # Registration page
│   │   └── dashboard.tsx      # Main dashboard
│   ├── components/
│   │   ├── DashboardLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── RecordingCard.tsx
│   │   └── RecentEntries.tsx
│   ├── lib/
│   │   ├── apiClient.ts       # Axios configuration
│   │   └── utils.ts           # Utility functions
│   ├── store/
│   │   └── authStore.ts       # Authentication state
│   └── styles/
│       └── globals.css        # Global styles
├── public/
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## Features Breakdown

### Authentication
- Email/password registration
- Login with JWT tokens
- Protected routes
- Persistent sessions

### Recording
- Browser-based audio recording
- Real-time duration display
- Audio processing with backend API
- Automatic transcription and AI analysis

### Dashboard
- Recent entries display
- Quick recording access
- Statistics overview
- Responsive grid layout

## API Integration

The web app connects to the backend API at `http://localhost:3000/api`.

Endpoints used:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/journals` - Fetch entries
- `POST /api/journals` - Create new entry

## Responsive Design

- Desktop: Full sidebar navigation
- Tablet: Collapsible sidebar
- Mobile: Bottom navigation

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Security

- JWT token authentication
- HTTP-only cookies option
- XSS protection
- CSRF protection
- Secure API calls

## Performance

- Static site generation where possible
- Image optimization with Next.js Image
- Code splitting
- Lazy loading components
- React Query caching

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t echo-web .

# Run container
docker run -p 3001:3000 echo-web
```

## Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Troubleshooting

### Audio recording not working
- Check browser permissions
- Ensure HTTPS in production
- Verify microphone access

### API connection issues
- Verify backend is running
- Check CORS configuration
- Verify API URL in .env

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT License - see LICENSE file
