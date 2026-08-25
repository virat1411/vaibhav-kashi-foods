import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "./db";

const COOKIE = "vkf_session";
const SESSION_DAYS = 14;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
};

function secret() {
  const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return new TextEncoder().encode(value);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || !payload.email || !payload.role) return null;
    return {
      id: payload.sub,
      email: String(payload.email),
      name: String(payload.name ?? ""),
      role: payload.role as Role,
      mustChangePassword: Boolean(payload.mustChangePassword),
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const session = await getSession();
  if (!session) {
    throw Object.assign(new Error("UNAUTHORIZED"), { status: 401 });
  }
  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await requireUser();
  if (!roles.includes(session.role)) {
    throw Object.assign(new Error("FORBIDDEN"), { status: 403 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || !user.isActive) {
    throw Object.assign(new Error("FORBIDDEN"), { status: 403 });
  }
  return { ...session, mustChangePassword: user.mustChangePassword };
}

export function isStaff(role: Role) {
  return role === "ADMIN" || role === "STAFF" || role === "DELIVERY";
}
