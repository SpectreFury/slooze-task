import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { Order } from "@/lib/models/Order";

export async function GET(
  req: NextRequest,
 { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = getAuthUser(req);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { orderId } = await params;
    const order = await Order.findById(orderId);    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      order: {
        id: order._id.toString(),
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        items: order.items,
        deliveryAddress: order.deliveryAddress,
        orderSummary: order.orderSummary,
        status: order.status,
        orderDate: order.orderDate,
        total: order.orderSummary.total
      }
    });

  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
