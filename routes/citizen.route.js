// routes/citizen.route.js
import { Router } from "express";
import { sendOTP, verifyOTP, renderLogin } from "../controllers/auth.controller.js";
import { requireAuth, authorizeRole } from "../middleware/auth.middleware.js";
import { renderDashboard } from "../controllers/dashboard.controller.js";

const router = Router(), ROLE = 'citizen';

// Verify citizen authentication for all routes below
router.use(authorizeRole(ROLE));

// Render Login Page
router.get('/login', (req, res) => renderLogin(req, res, ROLE));

// Authenticate Users
router.post('/send-otp', (req, res) => sendOTP(req, res, ROLE));
router.post('/verify-otp', verifyOTP);

// Verify citizens for routes below
router.use(requireAuth);

// Render Dashboard Page
router.get('/dashboard', renderDashboard);

export default router;