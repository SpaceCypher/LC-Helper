import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();
        const appPassword = process.env.APP_PASSWORD;

        if (password === appPassword) {
            const response = NextResponse.json({ success: true });

            // Set cookie expiry to 1 year
            const oneYear = 365 * 24 * 60 * 60 * 1000;

            response.cookies.set('lc_helper_auth', password, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: oneYear,
                path: '/',
            });

            return response;
        }

        return NextResponse.json(
            { error: 'Invalid password' },
            { status: 401 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
