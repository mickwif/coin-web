import crypto from 'crypto';
import { NextResponse } from 'next/server';

const generateSignature = (url: string, secretKey: string) => {
  return crypto
    .createHmac('sha256', secretKey)
    .update(new URL(url).search)
    .digest('base64');
};

export async function POST(req: Request) {
  const secretKey = process.env.MOONPAY_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { message: 'Moonpay secret key is not set' },
      { status: 500 }
    );
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json(
        { message: 'URL is required' },
        { status: 400 }
      );
    }
    
    const signature = generateSignature(url, secretKey);
    return NextResponse.json({ signature });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { message: 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
}

// Add this to handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}