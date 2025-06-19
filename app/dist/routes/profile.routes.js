"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("../controllers/profile.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const group_profile_controller_1 = require("../controllers/group.profile.controller");
const launch_controller_1 = require("../controllers/launch.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateJWT);
// Create wrapper functions for embedded controllers
const createEmbeddedHandler = (controller, basePath) => {
    return async (req, res) => {
        try {
            const method = req.method;
            const url = basePath + req.path;
            const data = { ...req.body, ...req.params, ...req.query, user: req.user };
            const result = await controller.handleRequest(method, url, data);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
};
// Group management routes using embedded pattern (specific routes first)
router.all("/groups*", createEmbeddedHandler(group_profile_controller_1.GroupProfileController, "/api/profiles"));
// Profile launch routes using embedded pattern  
router.all("/launch*", createEmbeddedHandler(launch_controller_1.LaunchController, "/api/profiles"));
// Profile management routes using embedded pattern (wildcard route last)
router.all("*", createEmbeddedHandler(profile_controller_1.ProfileController, "/api/profiles"));
exports.default = router;
