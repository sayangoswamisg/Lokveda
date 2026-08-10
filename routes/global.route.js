// routes/global.route.js [GLOBAL ROUTES — CRITICAL]
import { Router } from "express";
import adminRoutes from './admin.route.js';
import staffRoutes from './staff.route.js';
import citizenRoutes from './citizen.route.js';
import { checkUser, requireAuth } from "../middleware/auth.middleware.js";
import { renderProfile } from "../controllers/dashboard.controller.js";
import { logoutUser } from "../controllers/auth.controller.js";
import { postServiceData, renderApply, renderCreate, renderView, renderStatus } from "../controllers/service.controller.js";

const router = Router();

// Verify user in every step
router.use(checkUser);

// Home page
router.get('/', (req, res) => res.render('home', { _page: 'home' }));

// Role based access
router.use('/citizen', citizenRoutes);
router.use('/staff', staffRoutes);
router.use('/admin', adminRoutes);

// Require authentication in every step
router.use(requireAuth);

// View:
router.get('/profile', renderProfile); // User profile
router.get('/logout', logoutUser);     // Logout

// Form:
router.get('/services/apply', renderApply);          // Menu
router.get('/services/apply/:id', renderCreate);     // Create
router.get('/services/view/:id', renderView);        // View
router.post('/services/apply/:id', postServiceData); // Post
router.get('/services/status', renderStatus);        // Status

export default router;