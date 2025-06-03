import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { hash } from "bcrypt";
import { User } from "@/lib/models/User";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { firstName, lastName, email, password, role } = await req.json();

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      { error: "All the fields are required" },
      { status: 400 }
    );
  }
  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json(
      { error: "User already exists." },
      { status: 409 }
    );
  }
  // Hash the password before saving
  const hashedPassword = await hash(password, 10);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: role || "member",
  });

  return NextResponse.json({
    message: "User created",
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
}
