import { OrderModel } from "../../models/order.model";

export const getAllOrders = async () => {
  return await OrderModel.find()
    .populate("user", "firstName lastName email")
    .populate("products.product", "name price")
    .sort({ createdAt: -1 });
};

export const getOrderById = async (id: string) => {
  const order = await OrderModel.findById(id)
    .populate("user", "firstName lastName email")
    .populate("products.product", "name price");
  if (!order) throw new Error("Order not found");
  return order;
};

export const updateOrderStatus = async (id: string, body: any) => {
  const order = await OrderModel.findByIdAndUpdate(id, { status: body.status }, { new: true })
    .populate("user", "firstName lastName email")
    .populate("products.product", "name price");
  if (!order) throw new Error("Order not found");
  return order;
};

export const updatePaymentStatus = async (id: string, body: any) => {
  const order = await OrderModel.findByIdAndUpdate(id, { paymentStatus: body.paymentStatus }, { new: true })
    .populate("user", "firstName lastName email")
    .populate("products.product", "name price");
  if (!order) throw new Error("Order not found");
  return order;
};

export const deleteOrder = async (id: string) => {
  const order = await OrderModel.findByIdAndDelete(id);
  if (!order) throw new Error("Order not found");
  return order;
};