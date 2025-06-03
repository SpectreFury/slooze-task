"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { canViewRestaurants, canViewMenu, User } from "@/lib/rbac";

export default function RestaurantsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { getTotalItems } = useCartStore();

  const handleBackToDashboard = () => {
    router.push("/dashboard");
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
          const userData = await response.json();
          setUser(userData.user);
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

  const totalCartItems = getTotalItems();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <p className="text-lg text-neutral-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  // Check user permissions
  if (!user || !canViewRestaurants(user.role)) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Access Denied
          </h2>
          <p className="text-neutral-600 mb-4">
            You don't have permission to view restaurants.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const restaurants = [
    {
      id: 1,
      name: "Pizza Palace",
      cuisine: "Italian",
      rating: 4.5,
      deliveryTime: "25-35 min",
      deliveryFee: "$2.99",
      image: "🍕",
      description: "Authentic Italian pizzas with fresh ingredients",
    },
    {
      id: 2,
      name: "Burger Bistro",
      cuisine: "American",
      rating: 4.3,
      deliveryTime: "20-30 min",
      deliveryFee: "$1.99",
      image: "🍔",
      description: "Gourmet burgers and crispy fries",
    },
    {
      id: 3,
      name: "Sushi Express",
      cuisine: "Japanese",
      rating: 4.7,
      deliveryTime: "30-40 min",
      deliveryFee: "$3.99",
      image: "🍣",
      description: "Fresh sushi and traditional Japanese dishes",
    },
    {
      id: 4,
      name: "Taco Fiesta",
      cuisine: "Mexican",
      rating: 4.2,
      deliveryTime: "15-25 min",
      deliveryFee: "$2.49",
      image: "🌮",
      description: "Authentic Mexican tacos and burritos",
    },
    {
      id: 5,
      name: "Dragon Garden",
      cuisine: "Chinese",
      rating: 4.4,
      deliveryTime: "25-35 min",
      deliveryFee: "$2.99",
      image: "🥡",
      description: "Traditional Chinese cuisine with modern twists",
    },
    {
      id: 6,
      name: "Pasta Paradise",
      cuisine: "Italian",
      rating: 4.6,
      deliveryTime: "20-30 min",
      deliveryFee: "$2.49",
      image: "🍝",
      description: "Handmade pasta and classic Italian sauces",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}{" "}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button onClick={handleBackToDashboard} variant="outline">
              ← Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-neutral-900">Restaurants</h1>
          </div>
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
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Order from your favorite restaurants
          </h2>

          {/* Search Bar */}
          <div className="mb-6">
            <Input
              placeholder="Search restaurants, cuisines, or dishes..."
              className="max-w-md"
            />
          </div>

          {/* Category Filters */}
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-lg p-4 mb-8 border border-neutral-200">
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <span>Showing {restaurants.length} restaurants</span>
            <span>Average delivery time: 25 minutes</span>
          </div>
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl">{restaurant.image}</div>
                    <div>
                      <CardTitle className="text-lg">
                        {restaurant.name}
                      </CardTitle>
                      <p className="text-sm text-neutral-600">
                        {restaurant.cuisine}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    ⭐ {restaurant.rating}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 mb-4">
                  {restaurant.description}
                </p>

                <div className="flex items-center justify-between text-sm text-neutral-600 mb-4">
                  <span>🕒 {restaurant.deliveryTime}</span>
                  <span>🚚 {restaurant.deliveryFee}</span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => router.push(`/restaurants/${restaurant.id}`)}
                  disabled={!canViewMenu(user.role)}
                >
                  {canViewMenu(user.role) ? "View Menu" : "Menu Unavailable"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
