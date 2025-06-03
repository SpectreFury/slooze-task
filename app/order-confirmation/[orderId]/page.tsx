"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface OrderDetails {
  id: string;
  customerName: string;
  status: string;
  total: number;
  orderDate: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    restaurantName: string;
  }>;
  deliveryAddress: {
    address: string;
    city: string;
    zipCode: string;
  };
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data.order);
        } else {
          console.error("Failed to fetch order details");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-lg text-neutral-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-lg text-neutral-600">Order not found</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-neutral-900">
            Order Confirmation
          </h1>
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </header>

      
      <main className="max-w-4xl mx-auto px-6 py-8">
        
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Order Confirmed!
          </h2>
          <p className="text-lg text-neutral-600 mb-4">
            Thank you for your order, {order.customerName}!
          </p>
          <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
            Order #{order.id.slice(-8).toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start"
                  >
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-neutral-600">
                        from {item.restaurantName}
                      </p>
                      <p className="text-sm text-neutral-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-neutral-900">
                  Delivery Address
                </h4>
                <p className="text-neutral-600">
                  {order.deliveryAddress.address}
                  <br />
                  {order.deliveryAddress.city}, {order.deliveryAddress.zipCode}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-neutral-900">
                  Estimated Delivery
                </h4>
                <p className="text-neutral-600">25-35 minutes</p>
              </div>

              <div>
                <h4 className="font-medium text-neutral-900">Order Status</h4>
                <Badge className="bg-blue-100 text-blue-800">
                  {order.status.charAt(0).toUpperCase() +
                    order.status.slice(1).replace("_", " ")}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium text-neutral-900">Order Date</h4>
                <p className="text-neutral-600">
                  {new Date(order.orderDate).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button onClick={() => router.push("/restaurants")} size="lg">
            Order Again
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            size="lg"
          >
            Go to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
