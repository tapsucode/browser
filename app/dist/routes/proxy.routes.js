"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const proxy_controller_1 = require("../controllers/proxy.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJWT);
// Proxy config routes
router.get("/config", proxy_controller_1.ProxyController.getConfig);
router.put("/config", proxy_controller_1.ProxyController.updateConfig);
router.post("/test", proxy_controller_1.ProxyController.testConnection);
// Proxy CRUD routes
router.get("/", proxy_controller_1.ProxyController.getAllProxies);
router.get("/find", proxy_controller_1.ProxyController.findProxyByAddress);
router.get("/:id", proxy_controller_1.ProxyController.getProxyById);
router.post("/", proxy_controller_1.ProxyController.createProxy);
router.put("/:id", proxy_controller_1.ProxyController.updateProxy);
router.delete("/:id", proxy_controller_1.ProxyController.deleteProxy);
router.post("/:id/test", proxy_controller_1.ProxyController.testProxyConnection);
// Import/Export routes
router.post("/import", proxy_controller_1.ProxyController.importProxies);
router.post("/export", proxy_controller_1.ProxyController.exportProxies);
// Proxy groups routes
router.get("/groups", proxy_controller_1.ProxyController.getAllProxyGroups);
router.post("/groups", proxy_controller_1.ProxyController.createProxyGroup);
router.delete("/groups/:id", proxy_controller_1.ProxyController.deleteProxyGroup);
router.post("/groups/:id/add", proxy_controller_1.ProxyController.addProxiesToGroup);
router.post("/groups/:id/remove", proxy_controller_1.ProxyController.removeProxiesFromGroup);
router.get("/groups/:id/proxies", proxy_controller_1.ProxyController.getProxiesInGroup);
exports.default = router;
