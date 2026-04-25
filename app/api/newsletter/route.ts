import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address required' },
        { status: 400 }
      );
    }

    // ConvertKit API Configuration
    // TODO: Add these to your .env.local file:
    // CONVERTKIT_API_KEY=your_api_key_here
    // CONVERTKIT_FORM_ID=your_form_id_here
    
    const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
    const CONVERTKIT_FORM_ID = process.env.CONVERTKIT_FORM_ID;

    if (!CONVERTKIT_API_KEY || !CONVERTKIT_FORM_ID) {
      console.warn('ConvertKit not configured. Email would be:', email);
      
      // For now, return success to test the UI
      // Remove this in production!
      return NextResponse.json({
        success: true,
        message: 'Newsletter signup successful (dev mode)',
      });
    }

    // Subscribe to ConvertKit
    const response = await fetch(
      `https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: CONVERTKIT_API_KEY,
          email: email,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'ConvertKit API error');
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to subscribe. Please try again later.',
      },
      { status: 500 }
    );
  }
}
