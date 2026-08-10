
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const createToken = (payloadObj, expiresIn = process.env.MAX_AGE) => jwt.sign(payloadObj, process.env.JWT_SECRET, { expiresIn });



export const renderLogin = (req, res, _role) => res.render('auth', { _page: 'auth', _role, _js: ['auth'] });
    


export const sendOTP = async (req, res, _role) => {
    const { aadhaar, lat, lon } = req.body;
    try {
        // Send generated OTP to email & create auth token
        const _user = await User.verifyUserThenSendOTP(aadhaar, _role, parseFloat(lat), parseFloat(lon));
        const TOKEN = createToken({ id: _user.id, role: _user.role }, 5 * 60_000);
        res.cookie('authToken', TOKEN, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        // Respond censored user's email
        const [username, domain] = _user.profile.email.split('@');
        const email = username.length < 3 ? `${username[0]}***@${domain}` :
            username.length < 8 ?
                `${username.slice(0, 3)}***@${domain}` :
                `${username.slice(0, 3)}***${username.slice(username.length - 3, username.length)}@${domain}`;
        res.status(200).json({ message: `OTP sent to ${email} successfully ✅` });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};

export const verifyOTP = async (req, res) => {
    // Init: User I/p + JWT Auth Token
    const { otp } = req.body,
        AUTH_TOKEN = req.cookies.authToken;

    // Validate:
    try {
        // JWT AUTH TOKEN
        if (!AUTH_TOKEN) throw new Error("You haven't requested OTP yet 🫸");

        // SESSION
        const { _user, sessionID } = await new Promise((resolve, reject) => {
            jwt.verify(AUTH_TOKEN, process.env.JWT_SECRET, async (err, decoded) => {
                if (err) { // Invalid: Auth Token
                    console.error(err);
                    return reject(new Error('Token verification failed! Try again...😮‍💨'));
                }

                // Find user & check their existence
                const _user = await User.findById(decoded.id);
                if (!_user) return reject(new Error('User not found 😕' ));

                // Create JWT Session Token with user ID, role, sessionID
                const sessionID = crypto.randomUUID(),
                    SESSION_TOKEN = (() => req.cookies.sessionToken ? req.cookies.sessionToken : createToken({ id: decoded.id, role: decoded.role, sessionID }))();

                // Verify JWT with hashed sessionID in DB, else throw error
                jwt.verify(SESSION_TOKEN, process.env.JWT_SECRET, async (err, decoded) => {
                    // Invalid: Session Token
                    if (err) {
                        console.error(err);
                        return reject(new Error('Failed to validate session! Try again...😕'));
                    }
                    // Verify JWT
                    if (_user.security.sessionID) {
                        const isValidSession = await bcrypt.compare(decoded.sessionID, _user.security.sessionID);
                        if (!isValidSession) {
                            _user.security.sessionID = null;
                            _user.security.suspicious.logins++;
                            _user.security.suspicious.updatedAt = Date.now();
                            await _user.save();
                            return reject(new Error('Failed to validate session! Try again...😕'));
                        }
                    } else { // Generate new hashed session ID for JWT payload & save user document
                        const salt = await bcrypt.genSalt();
                        _user.security.sessionID = await bcrypt.hash(sessionID, salt);
                        await _user.save();
                    }
                    resolve({ _user, sessionID: decoded?.sessionID, error: null });
                });
            });
        });
        // OTP & CREATE SESSION
        const userName = await User.verifyOTP(_user, otp, req.ip);
        res.cookie('sessionToken', createToken({ id: _user.id, role: _user.role, sessionID }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: process.env.MAX_AGE
        });
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 5 * 60_000
        })
        res.status(200).json({ message: `Welcome ${userName} 😊`, role: _user.role });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.message });
    }
};



// Clear JWT cookie & redirect to login
export const logoutUser = async (req, res) => {
    const SESSION_TOKEN = req.cookies.sessionToken;
    try {
        if (SESSION_TOKEN) {
            const decoded = jwt.verify(SESSION_TOKEN, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (user) await User.logout(user);
        }
    } catch (err) { console.error(err); }
    res.clearCookie('sessionToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: process.env.MAX_AGE
    });
    res.redirect('/');
}