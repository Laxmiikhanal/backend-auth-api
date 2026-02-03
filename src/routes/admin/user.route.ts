import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { authorizedMiddelWare, adminMiddelware } from "../../middlewares/authorized.middleware";
import { uploads } from "../../middlewares/upload.middleware";

const router = Router();
const adminUserController = new AdminUserController();

// POST /api/admin/users  (create + image)
router.post(
  "/",
  authorizedMiddelWare,
  adminMiddelware,
  uploads.single("image"),
  (req, res) => adminUserController.createUser(req, res)
);

// GET /api/admin/users  (all users)
router.get(
  "/",
  authorizedMiddelWare,
  adminMiddelware,
  (req, res) => adminUserController.getUsers(req, res)
);

// GET /api/admin/users/:id  (single user)
router.get(
  "/:id",
  authorizedMiddelWare,
  adminMiddelware,
  (req, res) => adminUserController.getUserById(req, res)
);

// PUT /api/admin/users/:id  (update + optional image)
router.put(
  "/:id",
  authorizedMiddelWare,
  adminMiddelware,
  uploads.single("image"),
  (req, res) => adminUserController.updateUser(req, res)
);

// DELETE /api/admin/users/:id
router.delete(
  "/:id",
  authorizedMiddelWare,
  adminMiddelware,
  (req, res) => adminUserController.deleteUser(req, res)
);

export default router;
