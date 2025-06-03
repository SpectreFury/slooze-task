import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  restaurantName: {
    type: String,
    required: true,
  },
});

const PaymentDetailsSchema = new mongoose.Schema({
  cardNumber: {
    type: String,
    required: true,
  },
  cardName: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: String,
    required: true,
  },
  // CVV is not stored for security reasons
});

const DeliveryAddressSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
});

const OrderSummarySchema = new mongoose.Schema({
  subtotal: {
    type: Number,
    required: true,
  },
  deliveryFee: {
    type: Number,
    required: true,
  },
  serviceFee: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    items: [OrderItemSchema],
    paymentDetails: PaymentDetailsSchema,
    deliveryAddress: DeliveryAddressSchema,
    orderSummary: OrderSummarySchema,
    status: {
      type: String,
      enum: [
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "confirmed",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
