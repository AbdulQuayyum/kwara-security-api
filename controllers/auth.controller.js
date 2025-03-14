import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { HTTP_STATUS_OK, HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_UNAUTHORIZED, HTTP_STATUS_FORBIDDEN, HTTP_STATUS_NOT_FOUND, HTTP_STATUS_CONFLICT, HTTP_STATUS_TOO_MANY_REQUESTS, HTTP_STATUS_INTERNAL_SERVER_ERROR } from "../utilities/status.js";
import UserSchema from "../models/user.js";
import ResetPasswordSchema from '../models/resetPassword.js';
import { TwilioClient, TWILIO_PHONE_NUMBER } from '../utilities/index.js';

export async function LoginAccount(req, res) {
    const { emailAddress, password } = req.body;

    try {
        if (!emailAddress || !password) {
            return res.status(HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                status: HTTP_STATUS_BAD_REQUEST,
                message: "Error occurred",
                error: 'Email and Password are required'
            });
        }

        const user = await UserSchema.findOne({ emailAddress });
        if (!user) {
            return res.status(HTTP_STATUS_UNAUTHORIZED).json({
                success: false,
                status: HTTP_STATUS_UNAUTHORIZED,
                message: "Error occurred",
                error: 'Invalid credentials'
            });
        }

        if (!user.isVerified) {
            return res.status(HTTP_STATUS_UNAUTHORIZED).json({
                success: false,
                status: HTTP_STATUS_UNAUTHORIZED,
                message: "Error occurred",
                error: 'Your account is not verified. Please contact the admin.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(HTTP_STATUS_UNAUTHORIZED).json({
                success: false,
                status: HTTP_STATUS_UNAUTHORIZED,
                message: "Error occurred",
                error: 'Invalid password'
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign({ id: user._id, emailAddress: user.emailAddress }, process.env.JWT_SECRET, { expiresIn: '180d' });
        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Login successful',
            data: { emailAddress: user.emailAddress, token: token },
        });
    } catch (error) {
        res.status(HTTP_STATUS_BAD_REQUEST).json({
            success: false,
            status: HTTP_STATUS_BAD_REQUEST,
            message: 'Error occurred',
            error: error.message
        });
    }
}

export async function CreateAccount(req, res) {
    const { emailAddress, name, state, lga, ward, community, nin, phoneNumber, password } = req.body;

    try {
        if (!emailAddress || !name || !state || !lga || !ward || !community || !nin || !phoneNumber || !password) {
            return res.status(HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                status: HTTP_STATUS_BAD_REQUEST,
                message: "Error occurred",
                error: 'All fields are required'
            });
        }

        const existingUser = await UserSchema.findOne({ $or: [{ emailAddress }, { nin }, { phoneNumber }] });
        if (existingUser) {
            return res.status(HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                status: HTTP_STATUS_BAD_REQUEST,
                message: "Error occurred",
                error: 'User with this email, NIN, or phone number already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new UserSchema({ userID: uuidv4(), emailAddress, name, state, lga, ward, community, nin, phoneNumber, password: hashedPassword, isVerified: false });

        await user.save();

        res.status(HTTP_STATUS_CREATED).json({
            success: true,
            status: HTTP_STATUS_CREATED,
            message: 'Account created successfully. Please wait for admin verification.',
            data: []
        });
    } catch (error) {
        res.status(HTTP_STATUS_BAD_REQUEST).json({
            success: false,
            status: HTTP_STATUS_BAD_REQUEST,
            message: 'Error occurred',
            error: error.message
        });
    }
}

export async function ChangePassword(req, res) {
    const { id } = req.user;
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await UserSchema.findById(id);
        if (!user) {
            return res.status(HTTP_STATUS_NOT_FOUND).json({
                success: false,
                status: HTTP_STATUS_NOT_FOUND,
                message: "Error occurred",
                error: 'User not found'
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(HTTP_STATUS_UNAUTHORIZED).json({
                success: false,
                status: HTTP_STATUS_UNAUTHORIZED,
                message: "Error occurred",
                error: 'Current password is incorrect'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(HTTP_STATUS_BAD_REQUEST).json({
            success: false,
            status: HTTP_STATUS_BAD_REQUEST,
            message: 'Error occurred',
            error: error.message
        });
    }
}

export async function ForgotPassword(req, res) {
    const { phoneNumber } = req.body;

    try {
        if (!phoneNumber) {
            return res.status(HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                status: HTTP_STATUS_BAD_REQUEST,
                message: "Phone Number is required",
            });
        }

        const user = await UserSchema.findOne({ phoneNumber });
        if (!user) {
            return res.status(HTTP_STATUS_NOT_FOUND).json({
                success: false,
                status: HTTP_STATUS_NOT_FOUND,
                message: "User not found",
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const resetPassword = new ResetPasswordSchema({
            phoneNumber,
            token: otp,
            expiresAt: Date.now() + 60 * 60 * 1000,
        });

        await resetPassword.save();

        await TwilioClient.messages.create({
            body: `Your password reset code is: ${otp}. This code will expire in 1 hour.`,
            from: TWILIO_PHONE_NUMBER,
            to: user.phoneNumber,
        });

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Reset password OTP sent via SMS',
        });
    } catch (error) {
        res.status(HTTP_STATUS_BAD_REQUEST).json({
            success: false,
            status: HTTP_STATUS_BAD_REQUEST,
            message: 'Error occurred',
            error: error.message,
        });
    }
}

export async function ResetPassword(req, res) {
    const { token, newPassword } = req.body;

    try {
        if (!token || !newPassword) {
            return res.status(HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                status: HTTP_STATUS_BAD_REQUEST,
                message: "Error occurred",
                error: 'Token and new password are required'
            });
        }

        const resetRecord = await ResetPasswordSchema.findOne({ token, isUsed: false });
        if (!resetRecord) {
            return res.status(HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                status: HTTP_STATUS_BAD_REQUEST,
                message: "Error occurred",
                error: 'Invalid or expired token'
            });
        }

        const user = await UserSchema.findOne({ emailAddress: resetRecord.emailAddress });
        if (!user) {
            return res.status(HTTP_STATUS_NOT_FOUND).json({
                success: false,
                status: HTTP_STATUS_NOT_FOUND,
                message: "Error occurred",
                error: 'User not found'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        resetRecord.isUsed = true;
        await resetRecord.save();

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Password reset successfully',
            data: { emailAddress: user.emailAddress }
        });
    } catch (error) {
        res.status(HTTP_STATUS_BAD_REQUEST).json({
            success: false,
            status: HTTP_STATUS_BAD_REQUEST,
            message: 'Error occurred',
            error: error.message
        });
    }
}