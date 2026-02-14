// import { Router } from "express";
// import mongoose from "mongoose"; // ✅ add this
// import { AuthController } from "../controllers/auth.controller";
// import { authorizedMiddelWare, adminMiddelware } from "../middlewares/authorized.middleware";
// import { upload } from "../middlewares/upload.middleware";

// const router = Router();
// const authController = new AuthController();

// // ✅ helper: validate id first (so invalid id returns 400, not 403)
// const validateId = (req: any, res: any, next: any) => {
//   const { id } = req.params;
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ success: false, message: "Invalid id format" });
//   }
//   next();
// };

// // ✅ helper: allow self OR admin
// const selfOrAdmin = (req: any, res: any, next: any) => {
//   const requesterId =
//     req.user?._id?.toString() ||
//     req.user?.id?.toString() ||
//     req.user?.userId?.toString();

//   const targetId = req.params.id?.toString();

//   if (req.user?.role === "admin") return next();
//   if (requesterId && requesterId === targetId) return next();

//   return res.status(403).json({ success: false, message: "Forbidden" });
// };

// router.post("/register", (req, res) => authController.register(req, res));
// router.post("/login", (req, res) => authController.login(req, res));

// router.get("/whoami", authorizedMiddelWare, (req, res) =>
//   authController.whoami(req, res)
// );

// router.post("/forgot-password", (req, res) =>
//   authController.forgotPassword(req, res)
// );

// router.post("/reset-password", (req, res) =>
//   authController.resetPassword(req, res)
// );

// // ✅ UPDATE SELF (or admin) — this fixes tests 12, 13, 14, 15
// router.put(
//   "/:id",
//   authorizedMiddelWare,
//   validateId,     // ✅ invalid id becomes 400
//   selfOrAdmin,    // ✅ user can update own profile
//   upload.single("image"),
//   (req, res) => authController.update(req, res)
// );

// // admin create user (keep this)
// router.post(
//   "/user",
//   authorizedMiddelWare,
//   adminMiddelware,
//   upload.single("image"),
//   (req, res) => authController.createUser(req, res)
// );

// export default router;


import { Router } from "express";
import mongoose from "mongoose";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddelWare, adminMiddelware } from "../middlewares/authorized.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();
const authController = new AuthController();

const validateId = (req: any, res: any, next: any) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(String(id))) {
    return res.status(400).json({ success: false, message: "Invalid id format" });
  }
  next();
};

const selfOrAdmin = (req: any, res: any, next: any) => {
  const requesterId =
    req.user?._id?.toString() ||
    req.user?.id?.toString() ||
    req.user?.userId?.toString();

  const targetId = String(req.params.id || "");

  if (req.user?.role === "admin") return next();
  if (requesterId && requesterId === targetId) return next();

  return res.status(403).json({ success: false, message: "Forbidden" });
};

router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

router.get("/whoami", authorizedMiddelWare, (req, res) => authController.whoami(req, res));

router.post("/forgot-password", (req, res) => authController.forgotPassword(req, res));
router.post("/reset-password", (req, res) => authController.resetPassword(req, res));

router.put(
  "/:id",
  authorizedMiddelWare,
  validateId,
  selfOrAdmin,
  upload.single("image"),
  (req, res) => authController.update(req, res)
);

router.post(
  "/user",
  authorizedMiddelWare,
  adminMiddelware,
  upload.single("image"),
  (req, res) => authController.createUser(req, res)
);

export default router;
