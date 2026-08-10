
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { logoutUser } from '../controllers/auth.controller.js';

// Utility: verify user from DB
async function verifyUserFromDB(_user, decoded) {
    if (_user && _user.approved && decoded.role === _user.role) {
        const hashedID = _user.security.sessionID;
        return hashedID ? await bcrypt.compare(decoded.sessionID, _user.security.sessionID) : false;
    } else false;
}

// Check user is authenticated
export const requireAuth = (req, res, next) => {
    const TOKEN = req.cookies.sessionToken;
    if (!TOKEN) return res.redirect('/');
    jwt.verify(TOKEN, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.redirect('/');
        const _user = await User.findById(decoded.id);
        (await verifyUserFromDB(_user, decoded)) ? next() : await logoutUser(req, res);
    });
};

// Handle unauthorized access based on user role
export const authorizeRole = (allowedRole) => (req, res, next) => {
    // If unauthenticated allow access to login page
    if (!res.locals._user) return next();

    // If authenticated but role mismatch, redirect to their dashboard
    return res.locals._user.role !== allowedRole ?
        res.redirect(`/${res.locals._user.role}/dashboard`) :
        next();
};

export const checkUser = (req, res, next) => {
    // Set default to null for views for:
    res.locals._form = { id: null, name: null };
    res.locals._css = res.locals._js = null;

    // If no token, user is not authenticated
    const TOKEN = req.cookies.sessionToken;
    if (!TOKEN) {
        res.locals._user = res.locals._role = null;
        return next();
    }

    // Verify user & set user, role info in res.locals for views
    jwt.verify(TOKEN, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            res.locals._user = res.locals._role = null;
            return next();
        }
        const _user = await User.findById(decoded.id).populate('areaRef');
        if (verifyUserFromDB(_user, decoded)) {
            res.locals._user = _user;
            res.locals._role = _user.role;
            return next();
        }
        res.locals._user = res.locals._role = null;
        next();
    });
};