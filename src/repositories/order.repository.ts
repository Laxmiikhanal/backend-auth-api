import { OrderModel, IOrder } from "../models/order.model";

export class OrderRepository {
  async createOrder(data: Partial<IOrder>): Promise<IOrder> {
    const order = new OrderModel(data);
    await order.save();
    return order;
  }

  async getUserOrders(userId: string): Promise<IOrder[]> {
    return OrderModel.find({ user: userId }).populate("products.product").sort({ createdAt: -1 });
  }

  async getAllOrders(): Promise<IOrder[]> {
    return OrderModel.find().populate("user").populate("products.product").sort({ createdAt: -1 });
  }

  async updateOrderStatus(orderId: string, status: string): Promise<IOrder | null> {
    return OrderModel.findByIdAndUpdate(orderId, { status }, { new: true }).populate("user").populate("products.product");
  }

  async deleteOrder(orderId: string): Promise<boolean> {
    const result = await OrderModel.findByIdAndDelete(orderId);
    return !!result;
  }
}