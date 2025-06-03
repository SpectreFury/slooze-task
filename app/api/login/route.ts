import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { compare } from "bcrypt";
import { SignJWT } from "jose";
import { User } from "@/lib/models/User";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return NextResponse.json({ error: "User was not found" }, { status: 401 });
  }

  
  const isPasswordValid = await compare(password, user.password);

  if (!isPasswordValid) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      {
        status: 401,
      }
    );
  }  
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const token = await new SignJWT({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secret);

  
  const response = NextResponse.json({
    message: "Login successful",
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });

  
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, 
    path: "/",
  });

  return response;
}
