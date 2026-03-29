import { Types } from "mongoose";
import { OrderModel } from "../models/order.model";
import { ProductModel } from "../models/product.model";
import { HttpError } from "../errors/http-error";

type IncomingItem =
  | { productId: string; quantity: number }
  | { product: string; quantity: number }
  | { id: string; quantity: number };

function normalizeItems(items: IncomingItem[]) {
  return (items || []).map((i: any) => ({
    productId: i.productId || i.product || i.id,
    quantity: Number(i.quantity || 1),
  }));
}

export class OrderService {
  async placeOrder(userId: string, rawItems: IncomingItem[], paymentMethod: string) {
    if (!Types.ObjectId.isValid(userId)) throw new HttpError(400, "Invalid userId");

    const items = normalizeItems(rawItems);

    if (!items.length) throw new HttpError(400, "Order items are required");

    // Validate product ids
    for (const i of items) {
      if (!i.productId || !Types.ObjectId.isValid(i.productId)) {
        throw new HttpError(400, `Invalid productId: ${i.productId}`);
      }
      if (!i.quantity || i.quantity <= 0) {
        throw new HttpError(400, "Quantity must be at least 1");
      }
    }

    const productIds = items.map((i) => new Types.ObjectId(i.productId));

    const products = await ProductModel.find({ _id: { $in: productIds } }).select("_id");
    if (products.length !== productIds.length) {
      throw new HttpError(400, "One or more products not found");
    }

    const orderProducts = items.map((i) => ({
      product: new Types.ObjectId(i.productId),
      quantity: i.quantity,
    }));

    const order = await OrderModel.create({
      user: new Types.ObjectId(userId),
      products: orderProducts,
      status: "pending",
      // paymentMethod: paymentMethod, // add to schema if needed
    });

    return OrderModel.findById(order._id)
      .populate("user", "firstName lastName email")
      .populate("products.product");
  }

  async getUserOrders(userId: string) {
    if (!Types.ObjectId.isValid(userId)) throw new HttpError(400, "Invalid userId");

    return OrderModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("products.product");
  }
}