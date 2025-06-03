"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { useEffect, useState } from "react";
import {
  getRoleLabel,
  hasElevatedRole,
  canManageRestaurant,
  canCancelOrder,
  User,
} from "@/lib/rbac";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getTotalItems } = useCartStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null
  );

  const handleRestaurantsClick = () => {
    router.push("/restaurants");
  };

  const handleViewCart = () => {
    router.push("/cart");
  };
  const handleLogout = () => {
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
  };
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          await fetchOrders();
        } else {
          console.error("Failed to fetch user data");
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
    if (searchParams.get("orderSuccess") === "true") {
      setShowOrderSuccess(true);
      setTimeout(async () => {
        await fetchOrders();
      }, 1000);

      setTimeout(() => {
        setShowOrderSuccess(false);
        const url = new URL(window.location.href);
        url.searchParams.delete("orderSuccess");
        window.history.replaceState({}, "", url.toString());
      }, 5000);
    }
  }, [router, searchParams]);
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
    } finally {
      setOrdersLoading(false);
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
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: "cancelled" } : order
          )
        );
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
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalCartItems = getTotalItems();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-lg text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  if (!user || !user.role) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-neutral-900">
            Slooze Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            {totalCartItems > 0 && (
              <Button onClick={handleViewCart} className="relative">
                Cart ({totalCartItems})
              </Button>
            )}
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>{" "}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {showOrderSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🎉</span>
              <div>
                <h3 className="text-lg font-medium text-green-900">
                  Order Placed Successfully!
                </h3>
                <p className="text-green-700">
                  Your order has been confirmed and will be prepared shortly.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome back, {user.firstName}!
          </h2>
          <p className="text-neutral-600">
            Ready to order some delicious food?
          </p>
          <Badge className="mt-2" variant="secondary">
            {getRoleLabel(user.role)}
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {" "}
          {user.role === "member" && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Orders
                  </CardTitle>
                  <span className="text-lg">📦</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <p className="text-xs text-neutral-500">
                    {
                      orders.filter((order) => {
                        const orderDate = new Date(order.orderDate);
                        const lastMonth = new Date();
                        lastMonth.setMonth(lastMonth.getMonth() - 1);
                        return orderDate >= lastMonth;
                      }).length
                    }{" "}
                    from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Favorite Cuisine
                  </CardTitle>
                  <span className="text-lg">🍕</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {orders.length > 0 ? "Various" : "None"}
                  </div>
                  <p className="text-xs text-neutral-500">
                    {orders.length > 0
                      ? "Based on your orders"
                      : "Start ordering!"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Spent
                  </CardTitle>
                  <span className="text-lg">💰</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $
                    {orders
                      .reduce((total, order) => total + order.total, 0)
                      .toFixed(2)}
                  </div>
                  <p className="text-xs text-neutral-500">
                    Across {orders.length} orders
                  </p>
                </CardContent>
              </Card>
            </>
          )}
          {user.role === "manager" && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Restaurant Orders
                  </CardTitle>
                  <span className="text-lg">📊</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-neutral-500">+12 from yesterday</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Today's Revenue
                  </CardTitle>
                  <span className="text-lg">💰</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,248</div>
                  <p className="text-xs text-neutral-500">
                    +$340 from yesterday
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Menu Items
                  </CardTitle>
                  <span className="text-lg">🍽️</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28</div>
                  <p className="text-xs text-neutral-500">2 new items added</p>
                </CardContent>
              </Card>
            </>
          )}
          {user.role === "admin" && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Restaurants
                  </CardTitle>
                  <span className="text-lg">🏪</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-neutral-500">+3 new this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    System Revenue
                  </CardTitle>
                  <span className="text-lg">💰</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,480</div>
                  <p className="text-xs text-neutral-500">
                    +$2,340 from last week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <span className="text-lg">👥</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,248</div>
                  <p className="text-xs text-neutral-500">+89 new this week</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>{" "}
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={handleRestaurantsClick}
                className="h-20 flex flex-col space-y-2"
              >
                <span className="text-lg">🍽️</span>
                <span>Browse Restaurants</span>
              </Button>{" "}
              {totalCartItems > 0 && (
                <Button
                  onClick={handleViewCart}
                  className="h-20 flex flex-col space-y-2"
                  variant="outline"
                >
                  <span className="text-lg">🛒</span>
                  <span>View Cart ({totalCartItems})</span>
                </Button>
              )}
              {hasElevatedRole(user.role) && (
                <Button
                  onClick={() => router.push("/admin/restaurants")}
                  className="h-20 flex flex-col space-y-2"
                  variant="outline"
                >
                  <span className="text-lg">🏪</span>
                  <span>Manage Restaurants</span>
                </Button>
              )}
              {canManageRestaurant(user.role) && (
                <Button
                  onClick={() => router.push("/admin/orders")}
                  className="h-20 flex flex-col space-y-2"
                  variant="outline"
                >
                  <span className="text-lg">📋</span>
                  <span>View Orders</span>
                </Button>
              )}{" "}              <Button
                variant="outline"
                className="h-20 flex flex-col space-y-2"
                onClick={() => {
                  const ordersSection =
                    document.getElementById("orders-section");
                  if (ordersSection) {
                    ordersSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <span className="text-lg">📦</span>
                <span>View Orders ({orders.length})</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col space-y-2"
              >
                <span className="text-lg">❤️</span>
                <span>Favorites</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col space-y-2"
              >
                <span className="text-lg">👤</span>
                <span>Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>{" "}
        <Card id="orders-section">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="text-2xl mb-2">⏳</div>
                <p className="text-neutral-600">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🛍️</div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  No orders yet
                </h3>
                <p className="text-neutral-600 mb-4">
                  Ready to place your first order? Browse our restaurants!
                </p>
                <Button onClick={handleRestaurantsClick}>
                  Browse Restaurants
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{order.restaurantName}</h3>
                      <p className="text-sm text-neutral-600">
                        {order.items.map((item: any) => item.name).join(", ")}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDate(order.orderDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">${order.total.toFixed(2)}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                      </div>
                      {user &&
                        canCancelOrder(user.role) &&
                        order.status !== "delivered" &&
                        order.status !== "cancelled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingOrderId === order.id}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            {cancellingOrderId === order.id
                              ? "Cancelling..."
                              : "Cancel"}
                          </Button>
                        )}
                    </div>
                  </div>
                ))}
                {orders.length > 5 && (
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/orders")}
                    >
                      View All Orders ({orders.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
