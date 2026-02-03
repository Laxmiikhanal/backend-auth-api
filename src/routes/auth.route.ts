import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddelWare, adminMiddelware } from "../middlewares/authorized.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

router.get("/whoami", authorizedMiddelWare, (req, res) =>
  authController.whoami(req, res)
);

// ✅ PUT /api/auth/:id
router.put("/:id", authorizedMiddelWare, upload.single("image"), (req, res) =>
  authController.update(req, res)
);

// ✅ POST /api/auth/user (admin only)
router.post("/user", authorizedMiddelWare, adminMiddelware, upload.single("image"), (req, res) =>
  authController.createUser(req, res)
);

export default router;
