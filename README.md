# Armada Den - Your Productivity Hub

A modern, full-featured productivity application built with Next.js 16, featuring Gmail integration, web search, and AI-powered chat capabilities.

## Features

- 🔐 **Authentication**: Secure user authentication with JWT tokens
- 📧 **Gmail Integration**: Read, compose, and send emails directly from the app
- 🔍 **Web Search**: Powered by SerpAPI for comprehensive web searches
- 💬 **AI Chat**: Integrated AI assistant using OpenAI GPT-4
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support
- ⚡ **Real-time Updates**: Live data synchronization and updates

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI, Lucide Icons
- **AI Integration**: Vercel AI SDK with OpenAI
- **Backend API**: FastAPI with Composio v0.9.1

## Prerequisites

- Node.js 18+ and pnpm
- Backend API running (see `COMPOSIO_FRONTEND_INTEGRATION_GUIDE.md`)
- OpenAI API key (for chat feature)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd armada-den-frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
armada-den-frontend/
├── app/                      # Next.js app router pages
│   ├── api/                  # API routes
│   │   └── chat/            # Chat API endpoint
│   ├── gmail/               # Gmail OAuth callback
│   ├── search/              # Search OAuth callback
│   ├── layout.tsx           # Root layout with providers
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── chat/               # Chat interface
│   ├── gmail/              # Gmail components
│   ├── layout/             # Layout components
│   ├── search/             # Search components
│   └── ui/                 # Reusable UI components
├── lib/                    # Utility libraries
│   ├── api.ts             # API client
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Helper functions
└── public/                # Static assets
```

## Usage

### Authentication

1. Register a new account or sign in with existing credentials
2. The app uses JWT tokens stored in localStorage for authentication

### Gmail Integration

1. Navigate to the Gmail tab
2. Click "Connect Gmail Account"
3. Authorize the application through Google OAuth
4. Start reading and composing emails

### Web Search

1. Navigate to the Search tab
2. Click "Connect Search Engine" (first time only)
3. Enter your search query and press Enter
4. View search results and history

### AI Chat

1. Navigate to the Chat tab
2. Type your message in the input field
3. Get AI-powered responses from GPT-4

## API Integration

The frontend connects to a FastAPI backend with Composio integration. See `COMPOSIO_FRONTEND_INTEGRATION_GUIDE.md` for detailed API documentation.

### Key Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/jwt/login`
- **Gmail**: `/api/gmail/connect`, `/api/gmail/read`, `/api/gmail/send`
- **Search**: `/api/search/connect`, `/api/search/query`
- **User**: `/api/users/me`

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- Component-based architecture

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_APP_URL` | Frontend application URL | Yes |
| `OPENAI_API_KEY` | OpenAI API key for chat | Optional |

## Deployment

### Quick Deploy to Vercel

1. **Fork/Clone this repository**

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
     NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
     ```
   - Click Deploy

3. **Verify deployment**
   - Test authentication
   - Check API connectivity
   - Verify all features work

### Detailed Deployment Guide

For comprehensive deployment instructions including:
- Vercel deployment (CLI & Dashboard)
- Netlify deployment
- AWS Amplify deployment
- Docker deployment
- Troubleshooting tips

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the complete guide.

### Environment Variables for Production

Copy these to your Vercel/Netlify dashboard:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.com
```

Optional variables:
```bash
OPENAI_API_KEY=your-openai-key
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## Features in Detail

### Gmail Integration
- Read emails with filtering (all/unread)
- Compose and send emails
- Create drafts
- OAuth 2.0 authentication
- Real-time email synchronization

### Web Search
- Powered by SerpAPI
- Search history tracking
- Result caching
- Quick re-search from history

### AI Chat
- GPT-4 powered conversations
- Context-aware responses
- Streaming responses
- Message history

## Troubleshooting

### Backend Connection Issues
- Ensure the backend API is running on `http://localhost:8000`
- Check CORS settings in the backend
- Verify API URL in `.env.local`

### OAuth Callback Errors
- Ensure callback URLs match in both frontend and backend
- Check that redirect URLs are properly configured in Composio

### Chat Not Working
- Verify `OPENAI_API_KEY` is set correctly
- Check OpenAI API quota and billing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the `COMPOSIO_FRONTEND_INTEGRATION_GUIDE.md`
- Review backend logs for API errors
- Open an issue on GitHub

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- AI powered by [OpenAI](https://openai.com/)
- Backend integration via [Composio](https://composio.dev/)
