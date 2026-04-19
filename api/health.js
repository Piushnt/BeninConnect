// api/health.js - Vercel Serverless Function
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    status: 'ok',
    message: 'BeninConnect Vercel API is running',
    timestamp: new Date().toISOString(),
    environment: 'vercel'
  });
}
