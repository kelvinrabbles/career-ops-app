import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken, getTokenCookieOptions } from "@/auth";
import { cookies } from "next/headers";

const MAX_USERS = 4;

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  // Check user limit
  const userCount = await prisma.user.count();
  if (userCount >= MAX_USERS) {
    return NextResponse.json({ error: "Maximum number of users reached (4). Contact the admin." }, { status: 403 });
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
    },
  });

  const token = signToken({ id: user.id, name: user.name, email: user.email });
  const cookieOptions = getTokenCookieOptions();
  const cookieStore = await cookies();
  cookieStore.set(cookieOptions.name, token, cookieOptions);

  return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
}
