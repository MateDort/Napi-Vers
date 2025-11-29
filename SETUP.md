# Quick Setup Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
SERPER_API_KEY=your_serper_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
CRON_SECRET=your_secret_token_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting API Keys:

1. **Serper API Key**: 
   - Sign up at [serper.dev](https://serper.dev)
   - Get your API key from the dashboard
   - Free tier includes 2,500 searches per month

2. **OpenAI API Key**:
   - Sign up at [platform.openai.com](https://platform.openai.com)
   - Create an API key
   - Make sure you have credits available

3. **CRON_SECRET** (Optional):
   - Generate a random string for securing the cron endpoint
   - Only needed if using external cron services

## 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 4. How It Works

- **Daily Generation**: The app automatically generates a new poem at midnight (00:00) using a cron job
- **Event Detection**: Uses Serper API to search for Hungarian literary events, birthdays, and anniversaries
- **Poem Selection**: GPT-4 selects an appropriate poem based on the events
- **Storage**: Poems and author data are stored locally in the `data/` directory

## 5. Manual Poem Generation

You can manually trigger poem generation by calling:
```bash
curl http://localhost:3000/api/cron/generate-poem \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or visit the endpoint in your browser (if CRON_SECRET is not set).

## 6. Production Deployment

For production (e.g., Vercel):

1. Set environment variables in your hosting platform
2. Set up a cron job to call `/api/cron/generate-poem` at midnight UTC
3. Or use Vercel Cron Jobs (if deploying to Vercel)

### Vercel Cron Configuration

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/generate-poem",
    "schedule": "0 0 * * *"
  }]
}
```

## Troubleshooting

- **"SERPER_API_KEY not set"**: Make sure your `.env.local` file exists and contains the key
- **"OPENAI_API_KEY not set"**: Check your environment variables
- **Poem not generating**: Check server logs for errors
- **Cron not running**: The cron job only runs when the server is active. For production, use an external cron service.

