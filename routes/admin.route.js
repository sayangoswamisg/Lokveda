// routes/admin.route.js
import { Router } from "express";
import { sendOTP, verifyOTP, renderLogin } from "../controllers/auth.controller.js";
import { requireAuth, authorizeRole } from "../middleware/auth.middleware.js";
import { renderDashboard, renderProfileForAdmin } from "../controllers/dashboard.controller.js";
import {
    activateService, deactivateService,
    renderMenu,
    renderUpdate,
    renderApplicationForAdmin,
    approveProfile, rejectProfile,
    approveApplication, rejectApplication,
    renderReviewedApplications,
    renderApprovedApplications,
    renderRejectedApplications
} from "../controllers/service.controller.js";

const router = Router(), ROLE = 'admin';

// Verify admin authentication for all routes below
router.use(authorizeRole(ROLE));

// Render Login Page
router.get('/login', (req, res) => renderLogin(req, res, ROLE));

// Authenticate Users
router.post('/send-otp', (req, res) => sendOTP(req, res, ROLE));
router.post('/verify-otp', verifyOTP);

// Verify admins for routes below
router.use(requireAuth);

/* -------------------- Render Pages -------------------- */

router.get('/dashboard', renderDashboard);    // Dashboard
router.get('/services/update', renderUpdate); // Services

// Applications Menu:
router.get('/applications/reviewed', (req, res) => renderMenu(req, res, 'reviewed')); // Reviewed
router.get('/applications/approved', (req, res) => renderMenu(req, res, 'approved')); // Approved
router.get('/applications/rejected', (req, res) => renderMenu(req, res, 'rejected')); // Rejected

// Applications Type:
router.get('/applications/reviewed/:id', renderReviewedApplications); // Reviewed
router.get('/applications/approved/:id', renderApprovedApplications); // Approved
router.get('/applications/rejected/:id', renderRejectedApplications); // Rejected

// Applicants:
router.get('/profile/:serviceId/:userId', renderProfileForAdmin);         // Profile
router.get('/application/:serviceId/:userId', renderApplicationForAdmin); // Application

/* -------------------- POST Data -------------------- */

// Services:
router.post('/service/activate/:id', activateService);     // Activate
router.post('/service/deactivate/:id', deactivateService); // Deactivate

// Application:
router.post('/application/approve/:serviceId/:userId', approveApplication); // Approve 
router.post('/application/reject/:serviceId/:userId', rejectApplication);   // Reject

// Profile:
router.post('/profile/approve/:serviceId/:userId', approveProfile); // Approve 
router.post('/profile/reject/:serviceId/:userId', rejectProfile);   // Reject

export default router;