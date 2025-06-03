"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, canCancelOrder } from "@/lib/rbac";

export default function OrdersPage() {
  const router = useRouter();  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          await fetchOrders();
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [router]);
  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setCancellingOrderId(orderId);
    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        // Update the order status in the local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId
              ? { ...order, status: "cancelled" }
              : order
          )
        );
        // Optionally refresh orders from server
        await fetchOrders();
      } else {
        const errorData = await response.json();
        alert(`Failed to cancel order: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setCancellingOrderId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-lg text-neutral-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button onClick={() => router.push("/dashboard")} variant="outline">
              ← Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-neutral-900">My Orders</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">🛍️</div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">No orders yet</h2>
              <p className="text-neutral-600 mb-6">
                Ready to place your first order? Browse our restaurants and discover delicious food!
              </p>
              <Button onClick={() => router.push("/restaurants")} size="lg">
                Browse Restaurants
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-lg text-neutral-600">
                You have placed {orders.length} order{orders.length !== 1 ? 's' : ''}
              </h2>
            </div>

            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">                <CardHeader className="bg-neutral-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.restaurantName}</CardTitle>
                      <p className="text-sm text-neutral-600 mt-1">
                        Order #{order.id.slice(-8)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <p className="text-sm text-neutral-600 mt-1">
                          {formatDate(order.orderDate)}
                        </p>
                      </div>
                      {/* Cancel button for managers and admins */}
                      {user && canCancelOrder(user.role) && order.status !== "delivered" && order.status !== "cancelled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrderId === order.id}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {cancellingOrderId === order.id ? "Cancelling..." : "Cancel Order"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-neutral-900 mb-2">Items Ordered:</h4>
                      <div className="space-y-2">
                        {order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-neutral-700">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-neutral-900 font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {order.deliveryAddress && (
                      <div>
                        <h4 className="font-medium text-neutral-900 mb-2">Delivery Address:</h4>
                        <p className="text-neutral-600">
                          {order.deliveryAddress.address}, {order.deliveryAddress.city}, {order.deliveryAddress.zipCode}
                        </p>
                      </div>
                    )}

                    {/* Order Total */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-neutral-900">Total:</span>
                        <span className="text-lg font-bold text-neutral-900">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
