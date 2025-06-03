"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cartStore";
import { useEffect, useState } from "react";
import { canPlaceOrder, canAccessCheckout, User } from "@/lib/rbac";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
    // Form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [savedPaymentLoaded, setSavedPaymentLoaded] = useState(false);

  const totalPrice = getTotalPrice();
  const finalTotal = totalPrice + 2.99 + 1.99; // Including delivery and service fees
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          // Pre-fill card name with user's full name
          setCardName(`${data.user.firstName} ${data.user.lastName}`);
          
          // Load saved payment information
          await loadSavedPaymentInfo();
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

  const loadSavedPaymentInfo = async () => {
    try {
      const response = await fetch("/api/payment-info");
      if (response.ok) {
        const data = await response.json();
        const paymentInfo = data.paymentInfo;
        
        if (paymentInfo && Object.keys(paymentInfo).length > 0) {
          // Auto-populate form with saved data
          if (paymentInfo.cardName) setCardName(paymentInfo.cardName);
          if (paymentInfo.cardNumber) {
            // Show only last 4 digits with asterisks
            setCardNumber(`**** **** **** ${paymentInfo.cardNumber}`);
          }
          if (paymentInfo.expiryDate) setExpiryDate(paymentInfo.expiryDate);
          if (paymentInfo.address) setAddress(paymentInfo.address);
          if (paymentInfo.city) setCity(paymentInfo.city);
          if (paymentInfo.zipCode) setZipCode(paymentInfo.zipCode);
          
          setSavedPaymentLoaded(true);
        }
      }
    } catch (error) {
      console.error("Error loading saved payment info:", error);
    }
  };

  // Redirect if no items in cart
  useEffect(() => {
    if (!loading && items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, loading, router]);

  const handleBackToCart = () => {
    router.push("/cart");
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      if (!user || !canAccessCheckout(user.role)) {
      alert("You don't have permission to access checkout.");
      return;
    }

    setSubmitting(true);

    try {
      // Save payment information if checkbox is checked
      if (savePaymentInfo) {
        const paymentData = {
          cardName,
          cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces for saving
          expiryDate,
          address,
          city,
          zipCode
        };

        const saveResponse = await fetch("/api/payment-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        });

        if (!saveResponse.ok) {
          console.error("Failed to save payment information");
        }
      }

      const orderData = {
        userId: user.id,
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          restaurantName: item.restaurantName
        })),
        paymentDetails: {
          cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces
          cardName,
          expiryDate,
          // Don't store CVV for security (even in dummy implementation)
        },
        deliveryAddress: {
          address,
          city,
          zipCode
        },
        orderSummary: {
          subtotal: totalPrice,
          deliveryFee: 2.99,
          serviceFee: 1.99,
          total: finalTotal
        },
        status: "confirmed",
        orderDate: new Date().toISOString()
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });      if (response.ok) {
        const data = await response.json();
        clearCart();
        // Redirect to dashboard with success parameter to show orders
        router.push("/dashboard?orderSuccess=true");
      } else {
        const errorData = await response.json();
        alert(`Order failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  // Format card number with spaces
  const handleCardNumberChange = (value: string) => {
    // If saved payment is loaded and user is editing, clear the asterisks
    if (savedPaymentLoaded && value.includes('*')) {
      setSavedPaymentLoaded(false);
      setCardNumber('');
      return;
    }
    
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      setCardNumber(formatted);
    }
  };

  // Format expiry date MM/YY
  const handleExpiryChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      const formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
      setExpiryDate(formatted);
    } else {
      setExpiryDate(cleaned);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💳</div>
          <p className="text-lg text-neutral-600">Loading checkout...</p>
        </div>
      </div>
    );
  }
  if (!user || !canAccessCheckout(user.role)) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            Access Denied
          </h2>
          <p className="text-neutral-600 mb-4">
            Only restaurant managers and admins can access the checkout page.
          </p>
          <div className="space-x-2">
            <Button onClick={() => router.push("/cart")} variant="outline">
              Back to Cart
            </Button>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
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
            <Button onClick={handleBackToCart} variant="outline">
              ← Back to Cart
            </Button>
            <h1 className="text-2xl font-bold text-neutral-900">Checkout</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>                  <div>
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      type="text"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                  </div>
                  
                  {/* Save Payment Info Checkbox */}
                  <div className="flex items-center space-x-2">
                    <input
                      id="savePaymentInfo"
                      type="checkbox"
                      checked={savePaymentInfo}
                      onChange={(e) => setSavePaymentInfo(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="savePaymentInfo" className="text-sm font-normal">
                      Save payment information for future orders
                    </Label>
                  </div>
                  
                  {savedPaymentLoaded && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <p className="text-sm text-blue-800">
                        💳 Payment information loaded from your saved data. 
                        You can update any field and choose to save the changes.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="123 Main Street"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="New York"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        type="text"
                        placeholder="10001"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>$2.99</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Service Fee</span>
                      <span>$1.99</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? "Processing..." : `Place Order - $${finalTotal.toFixed(2)}`}
                  </Button>

                  <div className="text-xs text-neutral-500 text-center">
                    Estimated delivery: 25-35 minutes
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
