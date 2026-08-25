import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_FILE = /\.(.*)$/;

function secret() {
  const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-only-change-me";
  return new TextEncoder().encode(value);
}

export async function middleware(request: Request) {
  const url = new URL(request.url);
  if (PUBLIC_FILE.test(url.pathname) || url.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (!url.pathname.startsWith("/admin") && !url.pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  if (url.pathname === "/admin/login" || url.pathname === "/api/auth/login") {
    return NextResponse.next();
  }

  const token = request.headers.get("cookie")?.split("; ").find((c) => c.startsWith("vkf_session="))?.slice(12);
  if (!token) {
    if (url.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret());
    const role = String(payload.role);
    if (!["ADMIN", "STAFF", "DELIVERY"].includes(role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  } catch {
    if (url.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
