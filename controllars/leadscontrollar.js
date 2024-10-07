const moment = require("moment");
const NewLeads = require("../models/leadsModel");
const { isToday, isBeforeToday } = require("../utils/createNotefication");
const OtherUser = require("../models/otherUser");
const { leadRecivedEmail } = require("../utils/sendEmail");


const createNewLead = async (req, res, next) => {
    let reqData = req.body

    try {
        let newLead = new NewLeads({
            ...reqData, userId: req.user?._id,
            // , indiaMartKey: req.user?.indiaMartKey,
            tradeIndaiKey: req.user?.tradeIndaiKey
            , queryTime: moment(reqData.queryTime).format('YYYY-MM-DD HH:mm:ss')
        })
        // console.log("newLead", reqData, newLead);
        let createdLead = await newLead.save()
        if (["employee", "hr", "manager"].includes(req.user?.role) && createdLead?._id) {
            const userdata = await OtherUser.findById(req.user?._id);
            userdata.leadsAssign.push(createdLead?._id);
            await userdata.save();
        }else{
            const userdata = await OtherUser.findById(reqData?.leadAssignTo);
            userdata.leadsAssign.push(createdLead?._id);
            await userdata.save();
        }

        res.status(200).json({
            status: true,
            message: "Lead created succuss",
            createdLead
        })

    } catch (error) {
        // console.log(error);
        res.status(500).json({
            status: false,
            message: "Lead not created",
            error: error
        })
    }
}


const bulkLeadInset = async (req, res) => {
    try {
        let bulkData = await req.body
        let user = await req.user
        let data = bulkData.map((item) => {
            return {
                ...item,
                userId: user?._id,
                tradeIndaiKey: user?.tradeIndaiKey,
            }
        })
        // console.log(req.user , "<<<<<<<<adsfas" ,bulkData);
        const result = await NewLeads.insertMany(data);
        res.status(200).json({
            stattus: true,
            message: 'Bulk insert successful',
            result,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            stattus: false,
            error
        })
    }
}



const editLead = async (req, res, next) => {
    let reqData = req.body
    try {
        let findedDetails = await NewLeads.findByIdAndUpdate(req.params.id, {
            ...reqData
        }, { new: true })
        // console.log("newLead" ,reqData ,req.user ,newLead);

        if (findedDetails) {
            res.status(200).json({
                status: true,
                message: "Lead updated succuss",
                findedDetails
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Lead id not found",
            })
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: false,
            message: "Lead not updated",
            error: error
        })
    }
}



const getAllLead = async (req, res, next) => {
    try {
        // Get page and limit from query parameters
        let { leadSource, leadAddedBy } = req.query
        let page = parseInt(req.query?.page, 10) || 1;
        let limit = parseInt(req.query?.limit, 10) || 10;
        let startfromdate = req.query.startfromdate
        let endfromdate = req.query.endfromdate
        let leadStatus = req.query.leadStatus
        const isPositiveLead = req.query.isPositive; // Convert to boolean if needed
        const followUpOf = req.query.followUpOf; // Convert to boolean if needed

        const skip = ((page) - 1) * (limit);
        const query = {};
        if (leadSource) {
            const leadSourceArray = Array.isArray(leadSource) ? leadSource : [leadSource];
            query.leadSource = { $in: leadSourceArray };
        }
        if (isPositiveLead) { query.isPositiveLead = isPositiveLead; }
        // if (leadAssignTo) { query.leadAssignTo = leadAssignTo; }

        if (startfromdate && endfromdate) {
            query.queryTime = {
                $gte: moment(startfromdate).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
                $lte: moment(endfromdate).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
            };
        } else if (startfromdate) {
            query.queryTime = { $gte: moment(startfromdate).startOf('day').format('YYYY-MM-DD HH:mm:ss') };
        } else if (endfromdate) {
            query.queryTime = { $lte: moment(endfromdate).endOf('day').format('YYYY-MM-DD HH:mm:ss') };
        }

        if (leadStatus) {
            // Convert leadStatus to an array if it's a string
            const leadStatusArray = Array.isArray(leadStatus) ? leadStatus : [leadStatus];
            query['leadStatus.statusName'] = { $in: leadStatusArray };
        }

        let todayDate = new Date()
        // console.log(todayDate , "<<<<todayDate");
        if (followUpOf == "today") {
            query.$and = [
                { nextFollowUpDate: { $exists: true } }, // Ensure `nextFollowUpDate` exists
                { nextFollowUpDate: { $ne: "" } }, // Ensure `nextFollowUpDate` is not empty
                { nextFollowUpDate: { $eq: moment(todayDate).format('YYYY-MM-DD') } } // Apply the `$lt` condition
            ];
        }
        if (followUpOf == "pending") {
            query.$and = [
                { nextFollowUpDate: { $exists: true } }, // Ensure `nextFollowUpDate` exists
                { nextFollowUpDate: { $ne: "" } }, // Ensure `nextFollowUpDate` is not empty
                { nextFollowUpDate: { $lt: moment(todayDate).format('YYYY-MM-DD') } } // Apply the `$lt` condition
            ];
        }

        query.$and = query.$and || [];
        // console.log("leadAddedBy" , leadAddedBy);

        if (["employee", "hr", "manager"].includes(req.user?.role)) {
            const leadIds = req.user?.leadsAssign
            query.$and.push({
                $or: [
                    { userId: req.user?._id },
                    { _id: { $in: leadIds } }
                ]
            });

        } else {
            query.$and.push({
                $or: [
                    { companyId: req.user?._id },
                    { userId: req.user?._id },
                ]
            });
        }
        if (leadAddedBy) {
            const trimmedEmployeeName = leadAddedBy.trim();
            query.$and.push({
                $or: [
                    // {
                    //     $expr: {
                    //         $eq: [{ $trim: { input: "$leadAddedBy" } }, trimmedEmployeeName]
                    //     }
                    // },
                    {
                        $expr: {
                            $eq: [{ $trim: { input: "$leadAssignTo" } }, trimmedEmployeeName]
                        }
                    }
                ]
            });
        }

        let sortCondition = {};

        // Check if the role is admin and if leadAssignAt exists and is not empty
        if (["employee", "hr", "manager"].includes(req.user?.role)) {
            sortCondition.leadAssignAt = -1;
            sortCondition.queryTime = -1;
        } else {
            // For employee, hr, manager roles, or others
            sortCondition.queryTime = -1;
            sortCondition.createdAt = -1;
        } 
       
        let leads = await NewLeads.find(query).sort(sortCondition).skip(skip).limit(limit);


        const totalLeads = await NewLeads.countDocuments(query);

        res.status(200).json({
            status: true,
            message: "All Leads data",
            userAllLeads: leads,
            page,
            limit: limit || 10,
            totalPages: Math.ceil(totalLeads / (limit || 10)),
            totalLeads,
        })
    } catch (error) {
        // console.log(error);
        res.status(500).json({
            status: false,
            message: "Server Error",
            error: error
        })
    }
}

const searchQuary = async (req, res) => {

    let query = {}
    query.$and = query.$and || [];
    if (["employee", "hr", "manager"].includes(req.user?.role)) {
        const leadIds = req.user?.leadsAssign
        query.$and.push({
            $or: [
                { userId: req.user?._id },
                { _id: { $in: leadIds } }
            ]
        });

    } else {
        query.$and.push({
            $or: [
                { companyId: req.user?._id },
                { userId: req.user?._id },
            ]
        });
    }
    let userLeads = await NewLeads.find(query);
    let { searchValue } = req.query

    let filteredLead = userLeads.filter((ld) => {
        return ld.senderCompany?.toLowerCase().includes(searchValue.toLowerCase())
            || ld?.leadSource?.toLowerCase().includes(searchValue.toLowerCase())
            || ld?.senderState?.toLowerCase().includes(searchValue.toLowerCase())
            || ld?.senderName?.toLowerCase().includes(searchValue.toLowerCase())
            || ld?.senderEmail?.toLowerCase().includes(searchValue.toLowerCase())
            || ld?.uniqeQueryId?.toLowerCase().includes(searchValue.toLowerCase())
            || ld?.queryProductName?.toLowerCase().includes(searchValue.toLowerCase())
            || (ld?.senderMobileNumber && ld.senderMobileNumber.toString().includes(searchValue))
    })

    res.status(200).json({
        status: true,
        message: "Query result",
        data: filteredLead
    })


}

const getSingleLead = async (req, res, next) => {
    try {
        let { id } = req.params
        let lead = await NewLeads.findById(id)
        if (lead) {
            res.status(200).json({
                status: true,
                message: "Lead data",
                lead
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Lead not fount related to this id"
            })
        }

    } catch (error) {
        // console.log(error);
        res.status(500).json({
            status: false,
            message: "Server Error",
            error: error
        })
    }
}
const deleteLead = async (req, res, next) => {
    try {
        let { id } = req.params
        let lead = await NewLeads.findById(id)
        if (lead) {
            await NewLeads.findByIdAndDelete(id)
            res.status(200).json({
                status: true,
                message: "Lead deleted succuss",
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Lead not fount related to this id"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Server Error",
            error: error
        })
    }
}




const dashboardleadCount = async (req, res, next) => {
    const query = {};
    let employeeName = req.query?.employeeName

    query.$and = query.$and || [];
    if (["employee", "hr", "manager"].includes(req.user?.role)) {
        const leadIds = req.user?.leadsAssign
        query.$and.push({
            $or: [
                { userId: req.user?._id },
                { _id: { $in: leadIds || [] } }
            ]
        });

    } else {
        query.$and.push({
            $or: [
                { userId: req.user?._id },
                { companyId: req.user?._id },
            ]
        });
    }

    // Add filtering based on leadAddedBy or leadAssignTo if employeeName is provided
    if (employeeName) {
        const trimmedEmployeeName = employeeName.trim();
        query.$and.push({
            $or: [
                // {
                //     $expr: {
                //         $eq: [{ $trim: { input: "$leadAddedBy" } }, trimmedEmployeeName]
                //     }
                // },
                {
                    $expr: {
                        $eq: [{ $trim: { input: "$leadAssignTo" } }, trimmedEmployeeName]
                    }
                }
            ]
        });

    }

    let userAllLeads = await NewLeads.find(query || {}).lean()
        const ids = userAllLeads.map((itm) => itm?._id)
        
        // let datas= await NewLeads.updateMany(
        //     { _id: { $in: ids } },      // Filter to match multiple IDs
        //     { $set: { leadAssignTo: "" } }  // Update the isActive field
        // );
        // console.log(datas, ids);

    const totalLeads = await NewLeads.countDocuments(query);


    let postiveLead = userAllLeads.filter((ld) => ld.isPositiveLead == "true")
    let nagetiveLead = userAllLeads.filter((ld) => ld.isPositiveLead == "false")

    let todayFollowUp = userAllLeads.filter(lead => {
        return isToday(lead.nextFollowUpDate) == true
    });
    let pendingFollowUp = userAllLeads.filter(lead => {
        return isBeforeToday(lead.nextFollowUpDate) == true
    });


    res.status(200).json({
        status: true,
        message: "all types leads data fetched",
        data: {
            totalLeads: ["employee", "hr", "manager"].includes(req.user?.role) ? totalLeads : userAllLeads.length,
            postiveLead: postiveLead.length,
            nagetiveLead: nagetiveLead.length,
            todayFollowUp: todayFollowUp.length,
            pendingFollowUp: pendingFollowUp.length,
        }
    })
}


const getLeadsByStatus = async (req, res) => {
    let { status } = req.params
    let employeeName = req.query?.employee
    const query = {};
    query.$and = query.$and || [];
    if (employeeName && ["admin", "company"].includes(req.user?.role)) {
        // { leadAddedBy: employeeName },
        // { leadAssignTo: employeeName },
        query.$and.push({
            $or: [
                { leadAssignTo: employeeName },
            ]
        });
    }

    if (["employee", "hr", "manager"].includes(req.user?.role)) {
        const leadIds = req.user?.leadsAssign
        query.$and.push({
            $or: [
                { userId: req.user?._id },
                { _id: { $in: leadIds || [] } }
            ]
        });

    } else {
        query.$and.push({
            $or: [
                { userId: req.user?._id },
                { companyId: req.user?._id },
            ]
        });
    }

    let userLeads = await NewLeads.find(query)
    try {
        if (status == "positive") {
            let data = userLeads.filter((ld) => ld.isPositiveLead == "true")
            let formatRes = data.map((item) => {
                let { _id, senderName, senderEmail, senderCompany, senderMobileNumber, senderPhone } = item
                return { _id, senderName, senderEmail, senderMobileNumber, senderPhone, senderCompany }
            })
            res.status(200).json({
                status: true,
                message: "Positive Leads",
                data: formatRes
            })
        }
        if (status == "negative") {
            let data = userLeads.filter((ld) => ld.isPositiveLead == "false")
            let formatRes = data.map((item) => {
                let { _id, senderName, senderEmail, senderCompany, senderMobileNumber, senderPhone } = item
                return { _id, senderName, senderEmail, senderMobileNumber, senderPhone, senderCompany }
            })
            res.status(200).json({
                status: true,
                message: "Negative Leads",
                data: formatRes
            })
        }
        if (status == "pendingfollow") {
            let data = userLeads.filter((ld) => isBeforeToday(ld.nextFollowUpDate) == true)
            let formatRes = data.map((item) => {
                let { _id, senderName, senderEmail, senderCompany, senderMobileNumber, senderPhone } = item
                return { _id, senderName, senderEmail, senderMobileNumber, senderPhone, senderCompany }
            })
            res.status(200).json({
                status: true,
                message: "Pending followUp Leads",
                data: formatRes
            })
        }
        if (status == "todayfollow") {
            let data = userLeads.filter((ld) => isToday(ld.nextFollowUpDate) == true)
            let formatRes = data.map((item) => {
                let { _id, senderName, senderEmail, senderCompany, senderMobileNumber, senderPhone } = item
                return { _id, senderName, senderEmail, senderMobileNumber, senderPhone, senderCompany }
            })
            res.status(200).json({
                status: true,
                message: "Today followup Leads",
                data: formatRes
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false, error,
            message: " Leads not found related to query",
        })
    }
}



const getChartDetails = async (req, res) => {
    try {
        let employee = req.query?.employee
        let query = {}
        query.$and = query.$and || [];
        if (employee) {
            query.$and.push({
                $or: [
                    { leadAssignTo: employee },
                ]
            });;
        }
        if (["employee", "hr", "manager"].includes(req.user?.role)) {
            const leadIds = req.user?.leadsAssign
            query.$and.push({
                $or: [
                    { userId: req.user?._id },
                    { _id: { $in: leadIds || [] } }
                ]
            });

        } else {
            query.$and.push({
                $or: [
                    { userId: req.user?._id },
                    { companyId: req.user?._id },
                ]
            });
        }


        let userLeads = await NewLeads.find(query);
        let { record } = req.query

        const currentDate = new Date();
        const previousYear = currentDate.getFullYear() - 1;
        const startOfLastYear = new Date(previousYear, 0, 1); // January 1st of last year
        const endOfLastYear = new Date(previousYear, 11, 31, 23, 59, 59); // December 31st of last year
        const userLeadIds = userLeads.map(lead => lead._id); // Get IDs of filtered leads
        if (record == "6months") {
            const data = await NewLeads.aggregate([
                {
                    $match: {
                        _id: { $in: userLeadIds },
                    }
                },
                {
                    $addFields: {
                        // Check if `createdAt` exists and is a valid date, otherwise use `queryTime`
                        dateField: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gt: ["$createdAt", null] }, // Ensure createdAt is not null
                                        { $type: "$createdAt" },       // Ensure createdAt is a valid date type
                                        { $ne: ["$createdAt", ""] }    // Ensure createdAt is not an empty string
                                    ]
                                },
                                then: { $toDate: "$createdAt" },
                                else: {
                                    $cond: {
                                        if: {
                                            $and: [
                                                { $gt: ["$queryTime", null] },
                                                { $type: "$queryTime" },
                                                { $ne: ["$queryTime", ""] }
                                            ]
                                        },
                                        then: { $toDate: "$queryTime" },
                                        else: null // If neither createdAt nor queryTime is valid, set it to null
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        dateField: { $ne: null } // Exclude any documents where dateField is still null
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$dateField" },
                            month: { $month: "$dateField" }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                }
            ]);

            // console.log("data>>>.", sixMonthsAgo, data);

            // Fill in missing months in the last 6 months
            const chartData = [];
            for (let i = 0; i < 6; i++) {
                const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const monthData = data.find(d => d._id.year === month.getFullYear() && d._id.month === month.getMonth() + 1);
                chartData.push({
                    _id: { year: month.getFullYear(), month: month.getMonth() + 1 },
                    count: monthData ? monthData.count : 0
                });
            }

            res.status(200).json({
                success: true,
                data: chartData.reverse() // Reverse to have the oldest month first
            });
        } else if (record == "lastyear") {

            // Group filtered leads by month within the previous year
            const data = await NewLeads.aggregate([
                {
                    $match: {
                        _id: { $in: userLeadIds },
                        createdAt: { $gte: startOfLastYear, $lte: endOfLastYear } // Filter leads from the last year
                    }
                },
                {
                    $addFields: {
                        // Check if `createdAt` exists and is a valid date, otherwise use `queryTime`
                        dateField: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gt: ["$createdAt", null] }, // Ensure createdAt is not null
                                        { $type: "$createdAt" },       // Ensure createdAt is a valid date type
                                        { $ne: ["$createdAt", ""] }    // Ensure createdAt is not an empty string
                                    ]
                                },
                                then: { $toDate: "$createdAt" },
                                else: {
                                    $cond: {
                                        if: {
                                            $and: [
                                                { $gt: ["$queryTime", null] },
                                                { $type: "$queryTime" },
                                                { $ne: ["$queryTime", ""] }
                                            ]
                                        },
                                        then: { $toDate: "$queryTime" },
                                        else: null // If neither createdAt nor queryTime is valid, set it to null
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        dateField: { $ne: null } // Exclude any documents where dateField is still null
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$dateField" },
                            month: { $month: "$dateField" }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                }
            ]);

            // Fill in missing months in the last year
            const chartData = [];
            for (let i = 0; i < 12; i++) {
                const month = new Date(previousYear, i, 1);
                const monthData = data.find(d => d._id.year === month.getFullYear() && d._id.month === month.getMonth() + 1);
                chartData.push({
                    _id: { year: month.getFullYear(), month: month.getMonth() + 1 },
                    count: monthData ? monthData.count : 0
                });
            }

            res.status(200).json({
                success: true,
                data: chartData
            });
        } else {
            // Group filtered leads by month
            const data = await NewLeads.aggregate([
                {
                    $match: {
                        _id: { $in: userLeadIds }
                    }
                },
                {
                    $addFields: {
                        // Check if `createdAt` exists and is a valid date, otherwise use `queryTime`
                        dateField: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gt: ["$createdAt", null] }, // Ensure createdAt is not null
                                        { $type: "$createdAt" },       // Ensure createdAt is a valid date type
                                        { $ne: ["$createdAt", ""] }    // Ensure createdAt is not an empty string
                                    ]
                                },
                                then: { $toDate: "$createdAt" },
                                else: {
                                    $cond: {
                                        if: {
                                            $and: [
                                                { $gt: ["$queryTime", null] },
                                                { $type: "$queryTime" },
                                                { $ne: ["$queryTime", ""] }
                                            ]
                                        },
                                        then: { $toDate: "$queryTime" },
                                        else: null // If neither createdAt nor queryTime is valid, set it to null
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $match: {
                        dateField: { $ne: null } // Exclude any documents where dateField is still null
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$dateField" },
                            month: { $month: "$dateField" }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                }
            ]);

            // console.log(data , "<<<<<<<<<sdfsf");

            const currentYear = new Date().getFullYear();
            const allMonths = Array.from({ length: 12 }, (_, i) => ({
                _id: { year: currentYear, month: i + 1 },
                count: 0
            }));

            // Merge aggregated data with all months
            const mergedData = allMonths.map(month => {
                // console.log(month._id.year);
                const found = data.find(d => d._id.year == month._id.year && d._id.month === month._id.month);
                return found ? found : month;
            });

            res.status(200).json({
                success: true,
                data: mergedData
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



module.exports = {
    createNewLead, getAllLead,
    getSingleLead,
    deleteLead,
    dashboardleadCount,
    editLead,
    searchQuary, getChartDetails,
    getLeadsByStatus,
    bulkLeadInset
}