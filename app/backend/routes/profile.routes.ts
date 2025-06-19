import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { GroupProfileController } from "../controllers/group.profile.controller";
import { LaunchController } from "../controllers/launch.controller";

const router = Router();

router.use(authenticateJWT);

// Create wrapper functions for embedded controllers
const createEmbeddedHandler = (controller: any, basePath: string) => {
  return async (req: any, res: any) => {
    try {
      const method = req.method;
      const url = basePath + req.path;
      const data = { ...req.body, ...req.params, ...req.query, user: req.user };
      const result = await controller.handleRequest(method, url, data);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
};

// Group management routes using embedded pattern (specific routes first)
router.all("/groups*", createEmbeddedHandler(GroupProfileController, "/api/profiles"));

// Profile launch routes using embedded pattern  
router.all("/launch*", createEmbeddedHandler(LaunchController, "/api/profiles"));

// Profile management routes using embedded pattern (wildcard route last)
router.all("*", createEmbeddedHandler(ProfileController, "/api/profiles"));

export default router;
