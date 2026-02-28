import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * CORS middleware for /api/* routes.
 * Required for the FTP static-export frontend (vigilislawconsult.be) to call
 * the Railway backend (api.vigilislawconsult.be) with credentials: 'include'.
 */
function getAllowedOrigin(requestOrigin: string | null): string {
  const configured =
    process.env.NEXT_PUBLIC_FRONTEND_ORIGIN ?? 'https://vigilislawconsult.be';

  if (!requestOrigin) return configured;

  // In development, reflect any origin (allows localhost).
  if (process.env.NODE_ENV !== 'production') return requestOrigin;

  // In production, only allow the configured origin.
  return requestOrigin === configured ? requestOrigin : configured;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigin = getAllowedOrigin(origin);

  // Handle CORS preflight (OPTIONS).
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const response = NextResponse.next();

  // Only set CORS headers when there is a cross-origin request.
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
