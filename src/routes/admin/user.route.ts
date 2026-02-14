import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user.controller";
import {
  authorizedMiddelWare,
  adminMiddelware,
} from "../../middlewares/authorized.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();
const controller = new AdminUserController();

// ✅ TEST route (MUST be before "/:id")
router.get(
  "/test",
  authorizedMiddelWare,
  adminMiddelware,
  (req, res) => res.status(200).json({ success: true, message: "Admin test route works" })
);

// ✅ CREATE user
router.post(
  "/",
  authorizedMiddelWare,
  adminMiddelware,
  upload.single("image"),
  (req, res) => controller.createUser(req, res)
);

// ✅ GET all users
router.get(
  "/",
  authorizedMiddelWare,
  adminMiddelware,
  (req, res) => controller.getUsers(req, res)
);

// ✅ GET user by id
router.get(
  "/:id",
  authorizedMiddelWare,
  adminMiddelware,
  (req, res) => controller.getUserById(req, res)
);

// ✅ UPDATE user
router.put(
  "/:id",
  authorizedMiddelWare,
  adminMiddelware,
  upload.single("image"),
  (req, res) => controller.updateUser(req, res)
);

// ✅ DELETE user
router.delete(
  "/:id",
  authorizedMiddelWare,
  adminMiddelware,
  (req, res) => controller.deleteUser(req, res)
);

export default router;
