import { HTTP_STATUS_OK, HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_UNAUTHORIZED, HTTP_STATUS_FORBIDDEN, HTTP_STATUS_NOT_FOUND, HTTP_STATUS_CONFLICT, HTTP_STATUS_TOO_MANY_REQUESTS, HTTP_STATUS_INTERNAL_SERVER_ERROR } from "../utilities/status.js";
import CaseSchema from "../models/cases.js";
import UserSchema from "../models/user.js";

export async function GetUserProfile(req, res) {
    const { id } = req.user; 

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

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'User profile retrieved successfully',
            data: {
                userID: user.userID,
                emailAddress: user.emailAddress,
                name: user.name,
                state: user.state,
                lga: user.lga,
                ward: user.ward,
                community: user.community,
                nin: user.nin,
                phoneNumber: user.phoneNumber,
                isVerified: user.isVerified,
                isAdmin: user.isAdmin,
                isSuspended: user.isSuspended,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
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

export async function UpdateUserProfile(req, res) {
    const { id } = req.user;
    const { name, state, lga, ward, community, phoneNumber, emailAddress, nin } = req.body;

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

        if (name) user.name = name;
        if (state) user.state = state;
        if (lga) user.lga = lga;
        if (ward) user.ward = ward;
        if (community) user.community = community;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (emailAddress) user.emailAddress = emailAddress;
        if (nin) user.nin = nin;

        await user.save();

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'User profile updated successfully',
            data: {
                emailAddress: user.emailAddress,
                name: user.name,
                state: user.state,
                lga: user.lga,
                ward: user.ward,
                community: user.community,
                phoneNumber: user.phoneNumber,
                emailAddress: user.emailAddress,
                nin: user.nin,
            }
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

export async function ReportCase(req, res) {
    const { userID, subject, description, time } = req.body;

    try {
        if (!userID || !subject || !description || !time) {
            return res.status(HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                status: HTTP_STATUS_BAD_REQUEST,
                message: "Error occurred",
                error: 'All fields are required (userID, subject, description, time)'
            });
        }

        const parsedTime = new Date(time);
        if (isNaN(parsedTime.getTime())) {
            return res.status(HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                status: HTTP_STATUS_BAD_REQUEST,
                message: "Error occurred",
                error: 'Invalid time format. Please provide a valid date/time.'
            });
        }

        const caseReport = new CaseSchema({
            userID,
            subject,
            description,
            time: parsedTime
        });

        await caseReport.save();

        res.status(HTTP_STATUS_CREATED).json({
            success: true,
            status: HTTP_STATUS_CREATED,
            message: 'Case reported successfully',
            data: { caseID: caseReport._id, time: caseReport.time }
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

export async function GetUserCases(req, res) {
    const { userID } = req.params;

    try {
        const cases = await CaseSchema.find({ userID }).sort({ createdAt: -1 });

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Cases retrieved successfully',
            data: cases.map(caseItem => ({
                caseID: caseItem._id,
                subject: caseItem.subject,
                description: caseItem.description,
                time: caseItem.time, 
                isViewed: caseItem.isViewed 
            }))
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

export async function GetCaseDetails(req, res) {
    const { caseID } = req.params;

    try {
        const caseItem = await CaseSchema.findById(caseID);
        if (!caseItem) {
            return res.status(HTTP_STATUS_NOT_FOUND).json({
                success: false,
                status: HTTP_STATUS_NOT_FOUND,
                message: "Error occurred",
                error: 'Case not found'
            });
        }

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Case details retrieved successfully',
            data: {
                caseID: caseItem._id,
                subject: caseItem.subject,
                description: caseItem.description,
                time: caseItem.time,
                isViewed: caseItem.isViewed
            }
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

export async function UpdateCase(req, res) {
    const { caseID } = req.params;
    const { subject, description, time } = req.body;

    try {
        const caseItem = await CaseSchema.findById(caseID);
        if (!caseItem) {
            return res.status(HTTP_STATUS_NOT_FOUND).json({
                success: false,
                status: HTTP_STATUS_NOT_FOUND,
                message: "Error occurred",
                error: 'Case not found'
            });
        }

        if (subject) caseItem.subject = subject;
        if (description) caseItem.description = description;
        if (time) caseItem.time = new Date(time);

        await caseItem.save();

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Case updated successfully',
            data: {
                caseID: caseItem._id,
                subject: caseItem.subject,
                description: caseItem.description,
                time: caseItem.time
            }
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