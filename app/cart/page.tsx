"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { useEffect, useState } from "react";
import { canPlaceOrder, canAccessCheckout, User } from "@/lib/rbac";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleBackToRestaurants = () => {
    router.push("/restaurants");
  };

  const handleLogout = () => {
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
  };  const handleCheckout = () => {
    if (!user || !canAccessCheckout(user.role)) {
      alert("Only restaurant managers and admins can access checkout. Members can view their cart but cannot place orders.");
      return;
    }
    // Redirect to checkout page
    router.push("/checkout");
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
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
  }, [router]);
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🛒</div>
          <p className="text-lg text-neutral-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50">
        {/* Header */}
        <header className="bg-white border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <Button onClick={handleBackToRestaurants} variant="outline">
                ← Back to Restaurants
              </Button>
              <h1 className="text-2xl font-bold text-neutral-900">Cart</h1>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </header>

        {/* Empty Cart */}
        <main className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="text-8xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-neutral-600 mb-8">
            Add some delicious items from our restaurants!
          </p>
          <Button onClick={handleBackToRestaurants} size="lg">
            Browse Restaurants
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button onClick={handleBackToRestaurants} variant="outline">
              ← Back to Restaurants
            </Button>
            <h1 className="text-2xl font-bold text-neutral-900">
              Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={clearCart}
              variant="outline"
              className="text-red-600"
            >
              Clear Cart
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Order Items
            </h2>
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-4xl">{item.image}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-2">
                        from {item.restaurantName}
                      </p>
                      <p className="text-lg font-bold text-neutral-900">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </div>

                    {/* Item Total */}
                    <p className="text-lg font-bold text-neutral-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>

                    {/* Remove Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>$2.99</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>$1.99</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${(totalPrice + 2.99 + 1.99).toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  disabled={
                    items.length === 0 || !user || !canAccessCheckout(user.role)
                  }
                >
                  {user && canAccessCheckout(user.role)
                    ? "Proceed to Checkout"
                    : "Manager Access Required"}
                </Button>

                {user && !canAccessCheckout(user.role) && (
                  <div className="text-xs text-neutral-500 text-center">
                    Only restaurant managers and admins can place orders
                  </div>
                )}

                <div className="text-xs text-neutral-500 text-center">
                  Estimated delivery: 25-35 minutes
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
