import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import mongoose from "mongoose";
import { hash } from "bcrypt";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
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

  const user = await User.create({ email, hashedPassword });
  return NextResponse.json({
    message: "User created",
    user: { email: user.email },
  });
}
