Note: I have pushed the env file as well just for the testing purposes. But we should never push secret keys to github

# Points of Interest Frontend

This is the frontend application for the Points of Interest project, built with Next.js. It provides an interactive map interface to view and analyze points of interest with emotional analysis.

## Features

- Interactive map visualization of POIs
- Emotional analysis charts and statistics
- Real-time data updates
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running (see backend README)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Setup

Before running the development server, create a `.env.local` file with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Then, install the dependencies:

```bash
npm install
# or
yarn install
```

## Project Structure

```
client/
├── app/            # Next.js app directory
│   ├── components/ # React components
│   ├── lib/        # Utility functions
│   └── page.tsx    # Main page
├── public/         # Static assets
└── styles/         # CSS styles
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
