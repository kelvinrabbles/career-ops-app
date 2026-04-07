import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, getTokenCookieOptions } from "@/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = signToken({ id: user.id, name: user.name, email: user.email });
  const cookieOptions = getTokenCookieOptions();
  const cookieStore = await cookies();
  cookieStore.set(cookieOptions.name, token, cookieOptions);

  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
