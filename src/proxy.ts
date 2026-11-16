import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedPage = createRouteMatcher(["/dashboard(.*)", "/workspace-select(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    // API callers expect JSON, so answer with a JSON 401 instead of an HTML sign-in page.
    if (isApiRoute(req)) {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized. Please sign in again." }, { status: 401 });
        }
        return;
    }
    if (isProtectedPage(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
