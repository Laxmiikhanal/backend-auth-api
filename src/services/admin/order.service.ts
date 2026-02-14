import mongoose from "mongoose";
import { OrderModel, ORDER_STATUSES } from "../../models/order.model";

const ALLOWED_STATUSES = ORDER_STATUSES;
type Status = (typeof ALLOWED_STATUSES)[number];

// optional transition rules
const TRANSITIONS: Record<Status, Status[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export class AdminOrderService {
  async list(opts: { page: number; limit: number; status?: Status }) {
    const { page, limit, status } = opts;

    const filter: any = {};
    if (status) filter.status = status;

    const safePage = Math.max(1, page || 1);
    const safeLimit = Math.min(Math.max(1, limit || 10), 100);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      OrderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .populate("userId", "firstName lastName email")
        .lean(),
      OrderModel.countDocuments(filter),
    ]);

    return {
      data: items,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    return OrderModel.findById(id)
      .populate("userId", "firstName lastName email")
      .populate("items.productId", "name price imageUrl")
      .lean();
  }

  async updateStatus(
    id: string,
    payload: { status: string; note?: string; cancelReason?: string },
    adminId?: string
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid order id");
    }

    const status = (payload.status || "").trim() as Status;
    const note = (payload.note || "").trim();
    const cancelReason = (payload.cancelReason || "").trim();

    if (!ALLOWED_STATUSES.includes(status)) {
      throw new Error(`Invalid status. Allowed: ${ALLOWED_STATUSES.join(", ")}`);
    }

    if (status === "cancelled" && !cancelReason) {
      throw new Error("cancelReason is required when status is cancelled");
    }

    const order = await OrderModel.findById(id);
    if (!order) throw new Error("Order not found");

    const current = order.status as Status;

    const allowedNext = TRANSITIONS[current] || [];
    if (allowedNext.length > 0 && !allowedNext.includes(status)) {
      throw new Error(`Invalid transition: ${current} -> ${status}`);
    }
    if (current === "delivered" || current === "cancelled") {
      throw new Error(`Order is already ${current} and cannot be changed`);
    }

    // status history
    if (Array.isArray((order as any).statusHistory)) {
      (order as any).statusHistory.push({
        status,
        at: new Date(),
        note: note || (status === "cancelled" ? cancelReason : ""),
        by: adminId && mongoose.Types.ObjectId.isValid(adminId) ? adminId : null,
      });
    }

    order.status = status as any;

    if (status === "cancelled") {
      (order as any).cancelReason = cancelReason;
      (order as any).cancelledAt = new Date();
    }

    await order.save();

    return OrderModel.findById(order._id)
      .populate("userId", "firstName lastName email")
      .populate("items.productId", "name price imageUrl")
      .lean();
  }
}
