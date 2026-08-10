// models/user.model.js
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import Area from './area.model.js';
import { verifyUserProximity } from './polygon.model.js';

// Declare: User Schema
const userSchema = new mongoose.Schema({
    aadhaar: {
        type: String,
        required: [true, 'Please provide your Aadhaar number'],
        unique: true,
        match: [/^[0-9]{12}$/, 'Aadhaar must be exactly 12 digits 🙂']
    },
    role: {
        type: String,
        enum: ['citizen', 'staff', 'admin'],
        required: true
    },
    approved: {
        type: Boolean,
        default: false
    },
    areaRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Area,
        required: true
    },
    allowedLocs: {
        type: Array,
        default: ['West Bengal']
    },
    profile: {
        name: {
            type: String,
            required: true
        },
        dob: {
            type: Date,
            required: true
        },
        email: {
            type: String,
            maxlength: 254,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        photoUrl: {
            type: String,
            default: 'default-avatar.png'
        }
    },
    security: {
        lat: {
            type: Number,
            default: null
        },
        lon: {
            type: Number,
            default: null
        },
        sessionID: {
            type: String,
            default: null
        },
        loginAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: {
            type: Date,
            default: null
        },
        otp: {
            code: {
                type: String,
                default: null
            },
            verified: {
                type: Boolean,
                default: false
            },
            createdAt: {
                type: Date,
                default: null
            },
            verificationBeganAt: {
                type: Date,
                default: null
            }
        },
        lastLoginAgent: {
            type: String
        },
        lastIP: {
            type: String
        },
        lastSeen: {
            type: Date
        },
        lastLocation: {
            type: String,
            default: null
        },
        suspicious: {
            logins: {
                type: Number,
                default: 0
            },
            updatedAt: {
                type: Date,
                default: null
            }
        }
    },
    services: {
        pending: {
            type: Array,
            default: []
        },
        reviewed: {
            type: Array,
            default: []
        },
        approved: {
            type: Array,
            default: []
        },
        rejected: {
            type: Array,
            default: []
        }
    }
}, { timestamps: true });

/* ******************** UTILITIES ******************** */

// Convert time in ms to human readable format
function transcribeTime(timeInMS) {
    let min = Math.ceil(timeInMS / 60_000), msg = '';

    if (min > 1139) { // > 1 day
        const days = Math.floor(min / 1140);
        msg = `${days} day` + days > 1 ? 's' : '';
        min -= days * 1140;
    }
    if (min > 59) { // > 1 hr
        const hrs = Math.floor(min / 60);
        msg += `, ${hrs} hour` + hrs > 1 ? 's' : '';
        min -= hrs * 60;
    }
    if (min > 0)
        msg += ` and ${min} minute` + min > 1 ? 's' : '';

    return msg;
}

/* ******************** STATIC METHODS FOR USER AUTHENTICATION ******************** */

userSchema.statics.verifyUserThenSendOTP = async function (aadhaar, role, userLat, userLon) {
    // Check if user exists & is approved
    const _user = await this.findOne({ aadhaar }).populate('areaRef');
    if (!_user) throw new Error('User not found 😕');
    if (!_user.approved) throw new Error("You're not approved yet. Kindly contact your Panchayat Office 😊");

    // Block suspicious users
    if (_user.security.otp.createdAt > Date.now() - 30_000)
        throw new Error(`You've recently requested an OTP. Please wait ${((30_000 - (Date.now() - _user.security.otp.createdAt.getTime())) / 1000).toFixed(0)}s before requesting another one 😊`);

    // Redirect to respective login if role mismatch
    if (_user.role !== role) throw new Error('Please login through the ' + _user.role + ' portal 😊');

    // Look for account lock
    if (_user.security.lockUntil > Date.now())
        throw new Error(`Account locked for ${transcribeTime(_user.security.lockUntil - Date.now())}. Please email us if it wasn't you 😕`);

    // Handle excessive login attempts
    if (_user.security.loginAttempts > 4) {
        _user.security.lockUntil = new Date(Date.now() + 36_00_000); // Lock for 1 hr
        _user.security.loginAttempts = 0;                            // Reset login attempts
        await _user.save();
        throw new Error('Too many login attempts. Please wait an hour or email us to unlock your account ✅');
    }

    // Handle suspicious login attempts
    if (_user.security.suspicious.updatedAt < Date.now() - 864_00_000) { // 24 hrs
        _user.security.suspicious.logins = 0;
        _user.security.suspicious.updatedAt = Date.now();
        await _user.save();
    }
    else if (_user.security.suspicious.logins > 4) {
        _user.security.lockUntil = new Date(Date.now() + 192_00_000) // Lock for 3 hrs
        _user.security.suspicious.logins = 0;
        _user.security.suspicious.updatedAt = Date.now();
        await _user.save();
        throw new Error('Too many suspicious logins. Kindly wait till we verify your account 🫸');
    }

    // Clear previous sessionID if any active session in last 24 hrs
    if (_user.security.lastSeen && _user.security.lastSeen < Date.now() - 864_00_000) {
        _user.security.sessionID = null;
        _user.security.lastSeen = Date.now();
        await _user.save();
    }

    // Verify user's location
    const isValidLocation = await verifyUserProximity(_user, userLat, userLon);
    if (isValidLocation !== true) throw new Error(isValidLocation);

    // Generate hashed OTP
    const otp = crypto.randomInt(0, 1000000).toString().padStart(6, '0'),
        salt = await bcrypt.genSalt(),
        hashedOTP = await bcrypt.hash(otp, salt);

    // Send OTP to user's email
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from: `LokVeda <${process.env.EMAIL_USER}>`,
            to: _user.profile.email,
            subject: 'LokVeda OTP Verification',
            text: `Hello ${_user.profile.name}! Your OTP is ${otp}. It is valid for 5 minutes.`,
            html: `
                <div style="
                font-family: Arial, sans-serif;
                background-color: #f4f6f8;
                padding: 20px;
                ">
                <div style="
                    max-width: 420px;
                    margin: auto;
                    background: #ffffff;
                    padding: 24px;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                ">
                    <h2 style="color: #333;">LokVeda OTP Verification</h2>

                    <p style="font-size: 14px; color: #555;">
                    Hello <b>${_user.profile.name}</b>,
                    </p>

                    <p style="font-size: 14px; color: #555;">
                    Use the OTP below to complete your login:
                    </p>

                    <div style="
                    font-size: 26px;
                    letter-spacing: 6px;
                    font-weight: bold;
                    text-align: center;
                    margin: 20px 0;
                    padding: 12px;
                    background: #f0f0f0;
                    border-radius: 8px;
                    color: #111;
                    ">
                    ${otp}
                    </div>

                    <p style="font-size: 13px; color: #d9534f;">
                    ⏳ This OTP is valid for <b>5 minutes</b>.
                    </p>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

                    <p style="font-size: 12px; color: #888;">
                    If you did not request this, you can safely ignore this email.
                    </p>

                    <p style="font-size: 12px; color: #aaa; margin-top: 10px;">
                    — LokVeda Team
                    </p>
                </div>
                </div>
            `
        });
    } catch (err) { // Handle errors
        console.error(err);
        throw new Error('OTP sending failed 😕. Please try again later or contact support.');
    }

    // Store OTP & related info in user document
    _user.security.otp.code = hashedOTP;
    _user.security.otp.verified = false;
    _user.security.otp.createdAt = Date.now();
    await _user.save();

    // Return User
    return _user;
};

userSchema.statics.verifyOTP = async function (_user, otp, IP) {
    // Verify OTP & update login attempts
    const isMatch = await bcrypt.compare(otp, _user.security.otp.code);
    if (!isMatch) {
        _user.security.loginAttempts += 1;
        await _user.save();
        throw new Error('Wrong OTP 😟. Try again...😮‍💨');
    }
    if (_user.security.otp.verificationBeganAt > Date.now() - 15_000) throw new Error("We're verifying your OTP 🫸");
    if (_user.security.otp.createdAt < Date.now() - process.env.OTP_EXPIRY) throw new Error('OTP expired 😟. Try again...😮‍💨');
    if (_user.security.otp.verified) throw new Error('OTP already used. Please request a new one.');

    // Mark OTP as verified
    _user.security.otp.verified = true;
    _user.security.otp.code = null;
    _user.security.otp.expiry = null;

    // Reset login attempts & lock
    _user.security.loginAttempts = 0;
    _user.security.lockUntil = null;

    // Update last login info
    _user.security.lastLoginAgent = navigator.userAgent;
    _user.security.lastSeen = Date.now();
    _user.security.lastIP = IP;

    // Save user document & return user name
    await _user.save();
    return _user.profile.name;
};

// Clear session info in DB
userSchema.statics.logout = async function (_user) {
    _user.security.otp.verified = false;
    _user.security.sessionID = null;
    _user.security.lastSeen = Date.now();
    await _user.save();
};

// Export User model
export default mongoose.model('User', userSchema);