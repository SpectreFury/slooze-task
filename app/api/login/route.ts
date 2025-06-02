import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }
  const user = await User.findOne({ email });
  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }
  // In production, use JWT or session here
  return NextResponse.json({ message: "Login successful", user: { email: user.email } });
}
