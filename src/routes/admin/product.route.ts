import { Router } from "express";
import { AdminProductController } from "../../controllers/admin/product.controller";
import { authorizedMiddelWare, adminMiddelware } from "../../middlewares/authorized.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();
const controller = new AdminProductController();

router.use(authorizedMiddelWare, adminMiddelware);

router.get("/", (req, res) => controller.list(req, res));
router.get("/:id", (req, res) => controller.get(req, res));
router.post("/", upload.single("image"), (req, res) => controller.create(req, res));
router.put("/:id", upload.single("image"), (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.remove(req, res));

export default router;
