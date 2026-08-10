// routes/staff.route.js
import { Router } from "express";
import { sendOTP, verifyOTP, renderLogin } from "../controllers/auth.controller.js";
import { requireAuth, authorizeRole } from "../middleware/auth.middleware.js";
import { renderDashboard, renderProfileForStaff } from "../controllers/dashboard.controller.js";
import { renderApplicationForStaff, renderMenu, renderPendingApplications, renderRejectedApplications, reviewApplication, reviewProfile, unreviewApplication, unreviewProfile }
    from "../controllers/service.controller.js";

const router = Router(), ROLE = 'staff';

// Verify staff authentication for all routes below
router.use(authorizeRole(ROLE));

// Render Login Page
router.get('/login', (req, res) => renderLogin(req, res, ROLE));

// Authenticate Staff
router.post('/send-otp', (req, res) => sendOTP(req, res, ROLE));
router.post('/verify-otp', verifyOTP);

// Verify staffs for routes below
router.use(requireAuth);

/* -------------------- Render Pages -------------------- */

// Dashboard
router.get('/dashboard', renderDashboard);

// Applications Menu:
router.get('/applications/pending', (req, res) => renderMenu(req, res, 'pending'));   // Pending
router.get('/applications/rejected', (req, res) => renderMenu(req, res, 'rejected')); // Rejected

// Applications Type:
router.get('/applications/pending/:id', renderPendingApplications);   // Pending
router.get('/applications/rejected/:id', renderRejectedApplications); // Rejected

// Applicants:
router.get('/profile/:serviceId/:userId', renderProfileForStaff);         // Profile
router.get('/application/:serviceId/:userId', renderApplicationForStaff); // Application

/* -------------------- POST Data -------------------- */

// Application:
router.post('/application/approve/:serviceId/:userId', reviewApplication);  // Review
router.post('/application/reject/:serviceId/:userId', unreviewApplication); // Unreview

// Profile:
router.post('/profile/approve/:serviceId/:userId', reviewProfile);  // Review
router.post('/profile/reject/:serviceId/:userId', unreviewProfile); // Unreview

export default router;