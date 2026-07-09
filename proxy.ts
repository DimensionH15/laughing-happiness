import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Routes that REQUIRE login
const isProtectedRoute = createRouteMatcher([
    "/video-upload",
    "/image-upload",   // adjust to your actual path
    "/api/video-upload",
    "/api/image-upload",
]);

// Routes that a logged-in user shouldn't revisit (auth pages)
const isAuthRoute = createRouteMatcher([
    "/sign-in",
    "/sign-up",
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    const currentUrl = new URL(req.url);

    // Always send root "/" to "/home"
    if (currentUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/home", req.url));
    }

    // Logged-in users shouldn't see sign-in/sign-up again
    if (userId && isAuthRoute(req)) {
        return NextResponse.redirect(new URL("/home", req.url));
    }

    // Not logged in + trying to access a protected (upload) route -> sign in
    if (!userId && isProtectedRoute(req)) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};