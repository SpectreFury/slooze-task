import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { Order } from "@/lib/models/Order";
import { canCancelOrder, UserRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }    await dbConnect();

    const orders = await Order.find({ userId: user.userId })
      .sort({ orderDate: -1 })
      .limit(10);

    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      customerName: order.customerName,
      items: order.items,
      status: order.status,
      total: order.orderSummary.total,
      orderDate: order.orderDate,
      deliveryAddress: order.deliveryAddress,
      restaurantName: order.items[0]?.restaurantName || "Multiple Restaurants"
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const orderData = await req.json();    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    if (!orderData.paymentDetails || !orderData.deliveryAddress) {
      return NextResponse.json(
        { error: "Missing payment or delivery information" },
        { status: 400 }
      );    }

    const order = new Order({
      userId: user.userId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      items: orderData.items,      paymentDetails: {
        cardNumber: orderData.paymentDetails.cardNumber,
        cardName: orderData.paymentDetails.cardName,
        expiryDate: orderData.paymentDetails.expiryDate,
      },
      deliveryAddress: orderData.deliveryAddress,
      orderSummary: orderData.orderSummary,
      status: "confirmed",
      orderDate: new Date(),
    });

    await order.save();    return NextResponse.json({
      message: "Order placed successfully",
      orderId: order._id.toString(),
      order: {
        id: order._id.toString(),
        customerName: order.customerName,
        status: order.status,
        total: order.orderSummary.total,
        orderDate: order.orderDate,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}


export async function PATCH(req: NextRequest) {
  try {
    const user = getAuthUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canCancelOrder(user.role as UserRole)) {
      return NextResponse.json(
        { error: "Insufficient permissions to cancel orders" },
        { status: 403 }
      );
    }

    await dbConnect();

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      return NextResponse.json(
        { error: `Cannot cancel order that is ${order.status}` },
        { status: 400 }
      );
    }

    order.status = "cancelled";
    await order.save();

    return NextResponse.json({
      message: "Order cancelled successfully",
      orderId: order._id.toString(),
    });
  } catch (error) {
    console.error("Order cancellation error:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
