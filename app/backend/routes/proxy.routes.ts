import { Router } from "express";
import { ProxyController } from "../controllers/proxy.controller";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateJWT);
// Proxy config routes
router.get("/config", ProxyController.getConfig);
router.put("/config", ProxyController.updateConfig);
router.post("/test", ProxyController.testConnection);

// Proxy CRUD routes
router.get("/", ProxyController.getAllProxies);
router.get("/find", ProxyController.findProxyByAddress);
router.get("/:id", ProxyController.getProxyById);
router.post("/", ProxyController.createProxy);
router.put("/:id", ProxyController.updateProxy);
router.delete("/:id", ProxyController.deleteProxy);
router.post("/:id/test", ProxyController.testProxyConnection);

// Import/Export routes
router.post("/import", ProxyController.importProxies);
router.post("/export", ProxyController.exportProxies);

// Proxy groups routes
router.get("/groups", ProxyController.getAllProxyGroups);
router.post("/groups", ProxyController.createProxyGroup);
router.delete("/groups/:id", ProxyController.deleteProxyGroup);
router.post("/groups/:id/add", ProxyController.addProxiesToGroup);
router.post("/groups/:id/remove", ProxyController.removeProxiesFromGroup);
router.get("/groups/:id/proxies", ProxyController.getProxiesInGroup);

export default router;
