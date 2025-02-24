import { HTTP_STATUS_OK, HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_UNAUTHORIZED, HTTP_STATUS_FORBIDDEN, HTTP_STATUS_NOT_FOUND, HTTP_STATUS_CONFLICT, HTTP_STATUS_TOO_MANY_REQUESTS, HTTP_STATUS_INTERNAL_SERVER_ERROR } from "../utilities/status.js";
import CaseSchema from "../models/cases.js";
import UserSchema from "../models/user.js";
import { TwilioClient, TWILIO_PHONE_NUMBER } from '../utilities/index.js';

export async function CheckOutCase(req, res) {
    const { caseID } = req.params;

    try {
        if (!caseID) {
            return res.status(HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                status: HTTP_STATUS_BAD_REQUEST,
                message: "Error occurred",
                error: 'Case ID is required'
            });
        }

        const caseReport = await CaseSchema.findById(caseID);
        if (!caseReport) {
            return res.status(HTTP_STATUS_NOT_FOUND).json({
                success: false,
                status: HTTP_STATUS_NOT_FOUND,
                message: "Error occurred",
                error: 'Case not found'
            });
        }

        caseReport.isViewed = true;
        await caseReport.save();

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Case checked out successfully',
            data: { caseID: caseReport._id, isViewed: caseReport.isViewed }
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

export async function ResolveCase(req, res) {
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

        caseItem.isResolved = true;
        await caseItem.save();

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Case resolved successfully',
            data: { caseID: caseItem._id, isResolved: caseItem.isResolved }
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

export async function GetAllCases(req, res) {
    const { lga, ward, community, userName, sort } = req.query;
    
    try {
        let query = {};
        if (lga) query['user.lga'] = lga;
        if (ward) query['user.ward'] = ward;
        if (community) query['user.community'] = community;

        let cases = await CaseSchema.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userID',
                    foreignField: 'userID',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $match: query
            }
        ]);

        if (userName) {
            cases = cases.filter(caseItem => caseItem.user.name.includes(userName));
        }

        if (sort === 'asc') {
            cases.sort((a, b) => a.createdAt - b.createdAt);
        } else if (sort === 'desc') {
            cases.sort((a, b) => b.createdAt - a.createdAt);
        }

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Cases retrieved successfully',
            data: cases.map(caseItem => ({
                caseID: caseItem._id,
                userID: caseItem.userID,
                subject: caseItem.subject,
                description: caseItem.description,
                time: caseItem.time,
                isViewed: caseItem.isViewed,
                isResolved: caseItem.isResolved,
                reporter: {
                    name: caseItem.user.name,
                    lga: caseItem.user.lga,
                    ward: caseItem.user.ward,
                    community: caseItem.user.community
                }
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

export async function GetAllUsers(req, res) {
    const { isVerified, isSuspended, lga, ward, community } = req.query;

    try {
        const filter = {};
        if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
        if (isSuspended !== undefined) filter.isSuspended = isSuspended === 'true';
        if (lga) filter.lga = lga;
        if (ward) filter.ward = ward;
        if (community) filter.community = community;

        const users = await UserSchema.find(filter);

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Users retrieved successfully',
            data: users.map(user => ({
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

export async function VerifyUser(req, res) {
    const { userID } = req.params;

    try {
        const user = await UserSchema.findOne({
            userID: { $regex: userID, $options: 'i' }
        });

        if (!user) {
            return res.status(HTTP_STATUS_NOT_FOUND).json({
                success: false,
                status: HTTP_STATUS_NOT_FOUND,
                message: "User not found",
            });
        }

        if (user.isVerified) {
            return res.status(HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                status: HTTP_STATUS_BAD_REQUEST,
                message: "User is already verified",
            });
        }

        user.isVerified = true;
        await user.save();

        if (user.phoneNumber) {
            await TwilioClient.messages.create({
                body: `Hello ${user.name}, your account has been verified by an admin. You can now log in.`,
                from: TWILIO_PHONE_NUMBER,
                to: user.phoneNumber,
            });
        }

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'User verified successfully. SMS notification sent.',
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

export async function SuspendUser(req, res) {
    const { userID } = req.params;
    const { isSuspended } = req.body;

    try {
        const user = await UserSchema.findOne({
            userID: { $regex: userID, $options: 'i' }
        });

        if (!user) {
            return res.status(HTTP_STATUS_NOT_FOUND).json({
                success: false,
                status: HTTP_STATUS_NOT_FOUND,
                message: "Error occurred",
                error: 'User not found'
            });
        }

        user.isSuspended = isSuspended;
        await user.save();

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: `User ${isSuspended ? 'suspended' : 'unsuspended'} successfully`,
            data: { emailAddress: user.emailAddress, isSuspended: user.isSuspended }
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

export async function GetCaseStatistics(req, res) {
    const { lga, ward, community } = req.query;

    try {
        const filter = {};
        if (lga) filter.lga = lga;
        if (ward) filter.ward = ward;
        if (community) filter.community = community;

        const totalCases = await CaseSchema.countDocuments(filter);
        const resolvedCases = await CaseSchema.countDocuments({ ...filter, isResolved: true });
        const pendingCases = totalCases - resolvedCases;

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Case statistics retrieved successfully',
            data: {
                totalCases,
                resolvedCases,
                pendingCases
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

export async function GetUserStatistics(req, res) {
    try {
        const totalUsers = await UserSchema.countDocuments();
        const verifiedUsers = await UserSchema.countDocuments({ isVerified: true });
        const unverifiedUsers = await UserSchema.countDocuments({ isVerified: false });
        const suspendedUsers = await UserSchema.countDocuments({ isSuspended: true });

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'User statistics retrieved successfully',
            data: {
                totalUsers,
                verifiedUsers,
                unverifiedUsers,
                suspendedUsers
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

export async function Search(req, res) {
    const { query, type } = req.query;

    try {
        if (!query || !type) {
            return res.status(HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                status: HTTP_STATUS_BAD_REQUEST,
                message: "Error occurred",
                error: 'Query and type are required'
            });
        }

        let results;
        if (type === 'cases') {
            results = await CaseSchema.find({
                $or: [
                    { subject: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
            });
        } else if (type === 'users') {
            results = await UserSchema.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { emailAddress: { $regex: query, $options: 'i' } }
                ]
            });
        } else {
            return res.status(HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                status: HTTP_STATUS_BAD_REQUEST,
                message: "Error occurred",
                error: 'Invalid type. Use "cases" or "users".'
            });
        }

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Search results retrieved successfully',
            data: results
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

export async function GetCasesByLocation(req, res) {
    try {
        const casesByLocation = await CaseSchema.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userID',
                    foreignField: 'userID',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails' 
            },
            {
                $group: {
                    _id: {
                        lga: '$userDetails.lga',
                        ward: '$userDetails.ward',
                        community: '$userDetails.community'
                    },
                    totalCases: { $sum: 1 }, 
                    resolvedCases: {
                        $sum: {
                            $cond: [{ $eq: ['$isResolved', true] }, 1, 0] 
                        }
                    },
                    pendingCases: {
                        $sum: {
                            $cond: [{ $eq: ['$isResolved', false] }, 1, 0] 
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    lga: '$_id.lga',
                    ward: '$_id.ward',
                    community: '$_id.community',
                    totalCases: 1,
                    resolvedCases: 1,
                    pendingCases: 1
                }
            },
            {
                $sort: { totalCases: -1 }
            }
        ]);

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Case statistics by location retrieved successfully',
            data: casesByLocation
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

export async function GetTopLGAs(req, res) {
    try {
        const topLGAs = await CaseSchema.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userID',
                    foreignField: 'userID',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails' 
            },
            {
                $group: {
                    _id: '$userDetails.lga', 
                    totalCases: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    lga: '$_id',
                    totalCases: 1
                }
            },
            {
                $sort: { totalCases: -1 } 
            },
            {
                $limit: 10 
            }
        ]);

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Top LGAs with most cases retrieved successfully',
            data: topLGAs
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

export async function GetTopWards(req, res) {
    try {
        const topWards = await CaseSchema.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userID',
                    foreignField: 'userID',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $group: {
                    _id: '$userDetails.ward', 
                    totalCases: { $sum: 1 } 
                }
            },
            {
                $project: {
                    _id: 0,
                    ward: '$_id',
                    totalCases: 1
                }
            },
            {
                $sort: { totalCases: -1 } 
            },
            {
                $limit: 10 
            }
        ]);

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Top Wards with most cases retrieved successfully',
            data: topWards
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

export async function GetTopCommunities(req, res) {
    try {
        const topCommunities = await CaseSchema.aggregate([
            {
                $lookup: {
                    from: 'users', 
                    localField: 'userID',
                    foreignField: 'userID',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails' 
            },
            {
                $group: {
                    _id: '$userDetails.community',
                    totalCases: { $sum: 1 } 
                }
            },
            {
                $project: {
                    _id: 0,
                    community: '$_id',
                    totalCases: 1
                }
            },
            {
                $sort: { totalCases: -1 } 
            },
            {
                $limit: 10
            }
        ]);

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Top Communities with most cases retrieved successfully',
            data: topCommunities
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

export async function GetCasesByUser(req, res) {
    try {
        const casesByUser = await CaseSchema.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userID',
                    foreignField: 'userID',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails' 
            },
            {
                $group: {
                    _id: '$userDetails.name', 
                    totalCases: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    userName: '$_id',
                    totalCases: 1
                }
            },
            {
                $sort: { totalCases: -1 } 
            }
        ]);

        res.status(HTTP_STATUS_OK).json({
            success: true,
            status: HTTP_STATUS_OK,
            message: 'Case statistics by user retrieved successfully',
            data: casesByUser
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