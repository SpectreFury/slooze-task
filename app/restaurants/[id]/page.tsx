"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter, useParams } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { useEffect, useState } from "react";
import { canViewMenu, canAddToCart, User } from "@/lib/rbac";

export default function RestaurantMenuPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.id as string;
  const { addItem, getTotalItems } = useCartStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleBackToRestaurants = () => {
    router.push("/restaurants");
  };

  const handleViewCart = () => {
    router.push("/cart");
  };  const handleLogout = () => {
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/auth/me");        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);

          if (!canViewMenu(userData.user.role)) {
            router.push("/restaurants");
            return;
          }
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

    getUser();  }, [router]);

  const restaurant = {
    id: parseInt(restaurantId),
    name: "Pizza Palace",
    cuisine: "Italian",
    rating: 4.5,
    deliveryTime: "25-35 min",
    deliveryFee: "$2.99",
    image: "🍕",
    description: "Authentic Italian pizzas with fresh ingredients",
  };

  const menuItems = [
    {
      id: "1",
      name: "Margherita Pizza",
      price: 18.99,
      description: "Fresh mozzarella, tomatoes, basil, olive oil",
      category: "Pizza",
      image: "🍕",
    },
    {
      id: "2",
      name: "Pepperoni Pizza",
      price: 21.99,
      description: "Pepperoni, mozzarella, tomato sauce",
      category: "Pizza",
      image: "🍕",
    },
    {
      id: "3",
      name: "Caesar Salad",
      price: 12.99,
      description: "Romaine lettuce, parmesan, croutons, caesar dressing",
      category: "Salads",
      image: "🥗",
    },
    {
      id: "4",
      name: "Garlic Bread",
      price: 8.99,
      description: "Fresh baked bread with garlic butter and herbs",
      category: "Appetizers",
      image: "🥖",
    },
    {
      id: "5",
      name: "Tiramisu",
      price: 9.99,
      description: "Classic Italian dessert with coffee and mascarpone",
      category: "Desserts",
      image: "🍰",
    },
    {
      id: "6",
      name: "Italian Soda",
      price: 4.99,
      description: "Refreshing carbonated drink with Italian flavors",
      category: "Beverages",
      image: "🥤",
    },
  ];

  const categories = [
    "All",
    "Pizza",
    "Salads",
    "Appetizers",
    "Desserts",
    "Beverages",
  ];
  const handleAddToCart = (item: (typeof menuItems)[0]) => {
    if (!user || !canAddToCart(user.role)) {
      alert("You don't have permission to add items to cart.");
      return;
    }

    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      image: item.image,
    });
  };
  const totalCartItems = getTotalItems();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <p className="text-lg text-neutral-600">Loading menu...</p>
        </div>
      </div>
    );  }

  if (!user || !canViewMenu(user.role)) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Access Denied
          </h2>
          <p className="text-neutral-600 mb-4">
            You don't have permission to view this menu.
          </p>
          <Button onClick={() => router.push("/restaurants")}>
            Back to Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button onClick={handleBackToRestaurants} variant="outline">
              ← Back to Restaurants
            </Button>
            <h1 className="text-2xl font-bold text-neutral-900">
              {restaurant.name}
            </h1>
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
        </div>      </header>      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg p-6 mb-8 border border-neutral-200">
          <div className="flex items-start space-x-4">
            <div className="text-6xl">{restaurant.image}</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                {restaurant.name}
              </h2>
              <p className="text-neutral-600 mb-4">{restaurant.description}</p>
              <div className="flex items-center space-x-6 text-sm">
                <Badge className="bg-green-100 text-green-800">
                  ⭐ {restaurant.rating}
                </Badge>
                <span className="text-neutral-600">
                  🕒 {restaurant.deliveryTime}
                </span>
                <span className="text-neutral-600">
                  🚚 {restaurant.deliveryFee}
                </span>
                <span className="text-neutral-600">{restaurant.cuisine}</span>
              </div>
            </div>
          </div>        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              size="sm"
            >
              {category}
            </Button>
          ))}        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-4xl">{item.image}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-2">
                        {item.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xl font-bold text-neutral-900 mb-2">
                      ${item.price}
                    </p>{" "}
                    <Button
                      onClick={() => handleAddToCart(item)}
                      size="sm"
                      className="whitespace-nowrap"
                      disabled={!canAddToCart(user.role)}
                    >
                      {canAddToCart(user.role)
                        ? "Add to Cart"
                        : "Not Available"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
