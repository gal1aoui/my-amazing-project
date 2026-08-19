import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = cookies().get('github_oauth_state')?.value;

  // If we have a code, we are in the callback
  if (code) {
    // Verify state to prevent CSRF
    if (!state || state !== storedState) {
      return new NextResponse('Invalid state parameter', { status: 400 });
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: GITHUB_REDIRECT_URI,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await tokenResponse.json();

      // Fetch user info using the access token
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          'Accept': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const user = await userResponse.json();

      // Set session cookie (simplified)
      cookies().set('session', JSON.stringify({
        user: {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          login: user.login,
          avatar_url: user.avatar_url,
        },
        expires: Date.now() + 3600 * 1000, // 1 hour from now (GitHub tokens don't expire by default, but we set our own)
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 3600, // 1 hour
      });

      // Remove state cookie
      cookies().delete('github_oauth_state');

      // Redirect to home page after successful login
      return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return new NextResponse('Authentication failed', { status: 500 });
    }
  }

  // If no code, initiate OAuth flow
  const state = Math.random().toString(36).substring(2, 15);
  cookies().set('github_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  });

  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI);
  authUrl.searchParams.set('scope', 'read:user user:email');
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}