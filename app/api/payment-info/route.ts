import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userData = await User.findById(authUser.userId).select("savedPaymentInfo");
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      paymentInfo: userData.savedPaymentInfo || {},
    });
  } catch (error) {
    console.error("Error loading payment info:", error);
    return NextResponse.json(
      { error: "Failed to load payment information" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();    const { cardName, cardNumber, expiryDate, address, city, zipCode } = body;

    if (
      !cardName ||
      !cardNumber ||
      !expiryDate ||
      !address ||
      !city ||
      !zipCode
    ) {
      return NextResponse.json(
        { error: "All payment fields are required" },
        { status: 400 }
      );
    }

    const last4Digits = cardNumber.slice(-4);

    await dbConnect();

    const updatedUser = await User.findByIdAndUpdate(
      authUser.userId,
      {
        $set: {
          savedPaymentInfo: {
            cardName,
            cardNumber: last4Digits,
            expiryDate,
            address,
            city,
            zipCode,
          },
        },
      },
      { new: true }
    ).select("savedPaymentInfo");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Payment information saved successfully",
      paymentInfo: updatedUser.savedPaymentInfo,
    });
  } catch (error) {
    console.error("Error saving payment info:", error);
    return NextResponse.json(
      { error: "Failed to save payment information" },
      { status: 500 }
    );
  }
}
