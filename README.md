# Stika Frontend

The web application frontend for Stika - Nigeria's premier tricycle advertising platform. Turning everyday commutes into dynamic advertising opportunities.

## 🚀 Features

- **Agency Dashboard**: Comprehensive campaign management for advertising agencies
- **Campaign Creation**: Multi-step campaign creation with geofencing and budget management
- **Client Management**: Client onboarding and management tools
- **Real-time Analytics**: Campaign performance tracking and metrics
- **Responsive Design**: Mobile-first design with desktop optimization
- **Authentication**: Secure JWT-based authentication system

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks
- **API Integration**: Custom API service layer

## 🏗 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm package manager
- Backend API server running on port 8000

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ibnAbuMahdi/stika-frontend.git
cd stika-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── campaigns/         # Campaign management
│   ├── dashboard/         # Main dashboard
│   └── ...
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── ...
├── lib/                   # Utilities and API services
└── utils/                # Helper functions
```

## 🔐 Authentication

The application supports multiple user types:
- **Agency Users**: Full campaign creation and management access
- **Client Users**: Campaign overview and approval workflows

## 🌟 Key Pages

- **Dashboard** (`/dashboard`): Overview of campaigns, metrics, and quick actions
- **Campaigns** (`/campaigns`): Campaign listing, creation, and management
- **Campaign Creation** (`/campaigns/create`): Multi-step campaign creation wizard
- **Client Management** (`/clients`): Client onboarding and management
- **Profile** (`/profile`): User profile and agency settings

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1440px+)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- ESLint with Next.js recommended rules
- TypeScript strict mode enabled
- Tailwind CSS for styling
- Component-based architecture

## 🚀 Deployment

The application can be deployed on:
- Vercel (recommended)
- Netlify
- Any Node.js hosting platform

### Environment Variables for Production

```env
NEXT_PUBLIC_API_BASE_URL=https://api.stika.ng/api/v1
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is proprietary software owned by Stika Nigeria.

## 📞 Support

For support and questions:
- Email: support@stika.ng
- Website: [https://stika.ng](https://stika.ng)
