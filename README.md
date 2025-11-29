# Vers App - Hungarian Poetry Daily

A Next.js web application that displays a daily Hungarian poem based on important events in Hungary, especially related to literature, poets, and authors.

## Features

- **Daily Poem Selection**: Every midnight, the app checks for important Hungarian events using Serper API and selects an appropriate poem using GPT
- **Author Information**: Detailed biography and fun facts about the poet
- **Poem Analysis**: In-depth analysis and fun facts about the selected poem
- **AI Chat**: Interactive chat to ask questions about the author or poem
- **Beautiful UI**: Styled to match the classic poetry reading experience

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with your API keys:
```env
SERPER_API_KEY=your_serper_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
CRON_SECRET=your_secret_token_here (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Cron Job Setup

The app generates a new poem every midnight. You have two options:

### Option 1: Internal Cron (Development)
The cron job runs automatically when the server is running. For production, you may want to use an external service.

### Option 2: External Cron Service (Recommended for Production)
Use a service like Vercel Cron, EasyCron, or similar to call:
```
GET /api/cron/generate-poem
Authorization: Bearer YOUR_CRON_SECRET
```

## API Keys

- **Serper API**: Get your key from [serper.dev](https://serper.dev)
- **OpenAI API**: Get your key from [platform.openai.com](https://platform.openai.com)

## Project Structure

- `app/` - Next.js app directory with pages and API routes
- `lib/` - Core services (Serper, GPT, storage)
- `components/` - React components (chat interfaces)
- `data/` - Local storage for poems and author data

## License

MIT

