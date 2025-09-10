# 🚀 LinkBird.ai Clone

A production-ready full-stack application that replicates the core functionality of LinkBird.ai, featuring comprehensive leads management, campaign orchestration, and LinkedIn automation capabilities. Built with modern technologies and best practices for scalability and maintainability.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)](https://postgresql.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

## 🚀 Live Demo

[Kandid Replica at - kandid-replica.vercel.app ](https://kandid-replica.vercel.app)

## ✨ Features

### 🔐 Authentication & Security
- **Multi-provider Authentication**: Email/password and Google OAuth integration
- **Session Management**: Secure session handling with Better Auth
- **Protected Routes**: Middleware-based route protection
- **Input Validation**: Comprehensive validation with Zod schemas
- **Error Handling**: Robust error boundaries and user-friendly error messages

### 👥 Leads Management
- **Infinite Scroll Table**: High-performance pagination with cursor-based navigation
- **Advanced Search & Filtering**: Real-time search with debounced input and multi-criteria filtering
- **Lead Profile Side Sheets**: Comprehensive lead information with interaction timelines
- **Status Management**: Complete lead lifecycle with optimistic updates
- **Interaction Tracking**: Detailed timeline of all lead interactions
- **Bulk Operations**: Efficient lead management with bulk actions

### 📊 Campaign Management
- **Campaign Orchestration**: Complete campaign creation, management, and monitoring
- **Status Tracking**: Real-time campaign status with visual indicators
- **Progress Analytics**: Detailed progress bars and success rate calculations
- **Campaign Actions**: Pause/resume, edit, delete with confirmation dialogs
- **Tabbed Interface**: Organized campaign details with overview, leads, sequence, and settings
- **Response Rate Monitoring**: Advanced analytics and performance metrics

### 🎯 Additional Features
- **Dashboard Overview**: Comprehensive metrics and recent activity feed
- **Messages Management**: Advanced message handling with status tracking
- **LinkedIn Accounts**: Account management and API usage monitoring
- **Settings & Billing**: Complete user profile and subscription management
- **Admin Panel**: User management and system activity monitoring
- **Responsive Design**: Mobile-first responsive design with accessibility support

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand for client state, TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with multiple providers
- **Validation**: Zod schemas for type-safe validation
- **Caching**: TanStack Query for intelligent caching

### Database
- **ORM**: Drizzle ORM with TypeScript integration
- **Provider**: Neon PostgreSQL (serverless)
- **Migrations**: Automated database migrations
- **Indexing**: Optimized queries with proper indexing
- **Relationships**: Normalized schema with foreign key constraints

### Development & Deployment
- **Package Manager**: npm
- **Linting**: ESLint with Next.js configuration
- **Type Checking**: TypeScript strict mode
- **Deployment**: Vercel with automatic deployments
- **Environment**: Development, staging, and production configurations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon recommended)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/linkbird-clone.git
cd linkbird-clone
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```bash
# Better Auth Configuration
BETTER_AUTH_SECRET=your-super-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Seed Data
SEED_OWNER_USER_ID=your-user-id-here
```

### 4. Database Setup
```bash
# Generate database migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Google OAuth Setup

1. **Google Cloud Console**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API

2. **OAuth Credentials**
   - Navigate to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set authorized redirect URIs:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://your-app.vercel.app/api/auth/callback/google`

3. **Environment Variables**
   - Copy Client ID and Client Secret to your `.env.local` file

## 📁 Project Structure

```
linkbird-clone/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Protected app routes
│   │   ├── dashboard/           # Dashboard page
│   │   ├── leads/               # Leads management
│   │   ├── campaigns/           # Campaign management
│   │   ├── messages/            # Messages management
│   │   ├── linkedin-accounts/   # LinkedIn accounts
│   │   └── settings/            # Settings & billing
│   ├── admin/                   # Admin panel
│   ├── api/                     # API routes
│   ├── login/                   # Authentication pages
│   └── register/
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── leads/                   # Lead-specific components
│   ├── campaigns/               # Campaign-specific components
│   └── common/                  # Shared components
├── lib/                         # Utility functions
│   ├── auth.ts                  # Authentication configuration
│   ├── db.ts                    # Database connection
│   └── utils.ts                 # Helper functions
├── stores/                      # Zustand stores
├── hooks/                       # Custom React hooks
├── drizzle/                     # Database schema and migrations
└── public/                      # Static assets
```

## 🗄️ Database Schema

### Core Tables
- **`campaigns`**: Campaign information and status tracking
- **`leads`**: Lead profiles and contact information
- **`lead_interactions`**: Timeline of interactions with leads
- **`message_templates`**: Email sequence templates
- **`accounts`**: LinkedIn account management
- **`campaign_accounts`**: AutoPilot mode configuration

### Key Features
- **Normalized Design**: Proper relationships and foreign key constraints
- **Performance Indexing**: Optimized queries with strategic indexing
- **Type Safety**: Full TypeScript integration with Drizzle ORM
- **Data Integrity**: Comprehensive validation and constraints
- **Migration System**: Automated database migrations

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User sign out

### Leads Management
- `GET /api/leads` - Paginated leads with search/filter
- `GET /api/leads/[id]` - Individual lead details
- `PATCH /api/leads/[id]` - Update lead status
- `POST /api/leads/[id]/interactions` - Add interaction

### Campaign Management
- `GET /api/campaigns` - Campaign list with statistics
- `GET /api/campaigns/[id]` - Campaign details
- `PATCH /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign
- `GET /api/campaigns/[id]/stats` - Campaign metrics
- `GET /api/campaigns/[id]/leads` - Campaign leads

### Account Management
- `GET /api/accounts` - LinkedIn accounts
- `POST /api/accounts` - Add new account
- `PATCH /api/accounts/[id]` - Update account

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Push code to GitHub
   - Connect repository to Vercel
   - Configure build settings

2. **Environment Variables**
   - Set all required environment variables in Vercel dashboard
   - Ensure database URL is properly configured

3. **Deploy**
   - Vercel will automatically deploy on every push
   - Database migrations run automatically on first deployment

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Testing

### Manual Testing
```bash
# Start development server
npm run dev

# Test authentication
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test leads API
curl "http://localhost:3000/api/leads?limit=5"

# Test campaigns API
curl "http://localhost:3000/api/campaigns"
```

### Sample Data
The application includes comprehensive sample data:
- 3 sample campaigns with different statuses
- ~60 leads with realistic contact information
- Complete interaction timelines
- Message templates and sequences

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
```

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured with Next.js recommended rules
- **Prettier**: Code formatting (if configured)
- **Husky**: Git hooks for quality assurance (if configured)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Better Auth](https://www.better-auth.com/) - Modern authentication
- [TanStack Query](https://tanstack.com/query) - Data fetching and caching
- [Zustand](https://zustand-demo.pmnd.rs/) - State management


---

**Built with ❤️ using modern web technologies**