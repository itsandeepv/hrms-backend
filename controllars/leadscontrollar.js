const NewLeads = require("../models/leadsModel");
const { isToday, isBeforeToday } = require("../utils/createNotefication");


const createNewLead = async (req, res, next) => {
    let reqData = req.body
    try {
        let newLead = new NewLeads({
            ...reqData, userId: req.user?._id
            // , indiaMartKey: req.user?.indiaMartKey
            , tradeIndaiKey: req.user?.tradeIndaiKey
            , queryTime: new Date(reqData.queryTime)
        })
        // console.log("newLead" ,new Date(reqData.queryTime) );
        let createdLead = await newLead.save()
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
                // indiaMartKey: user?.indiaMartKey,
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
        let { page, limit, leadSource } = req.query
        let startfromdate = req.query.startfromdate
        let endfromdate = req.query.endfromdate
        let leadStatus = req.query.leadStatus
        const isPositiveLead = req.query.isPositive; // Convert to boolean if needed
        const followUpOf = req.query.followUpOf; // Convert to boolean if needed

        const skip = ((page) - 1) * (limit);
        const query = {};
        if (leadSource) { query.leadSource = leadSource; }
        if (isPositiveLead) { query.isPositiveLead = isPositiveLead; }
        if (startfromdate && endfromdate) {
            query.createdAt = { $gte: new Date(startfromdate), $lte: new Date(endfromdate) };
        }
        if (startfromdate) {
            query.createdAt = { $gte: new Date(startfromdate) };
        }
        if (endfromdate) {
            query.createdAt = { $lte: new Date(endfromdate) };
        }
        if (leadStatus) {
            // Convert leadStatus to an array if it's a string
            const leadStatusArray = Array.isArray(leadStatus) ? leadStatus : [leadStatus];
            query['leadStatus.statusName'] = { $in: leadStatusArray };
        }
        // query['createdAt'] = { $sort: { "createdAt": -1 } };
        // $sort: { "date_recorded": -1 }

        console.log(query, "ADFASDF");

        let leads = await NewLeads.find(query).sort({ queryTime: -1, createdAt: -1, }).skip(skip).limit(limit);

        let userAllLeads = leads.filter((ld) => {
            return ld.indiaMartKey == req.user?.indiaMartKey || ld.userId == req.user?._id
        })
        let todayFollowUp = userAllLeads.filter(lead => {
            return isToday(lead.nextFollowUpDate) == true
        });
        let pendingFollowUp = userAllLeads.filter(lead => {
            return isBeforeToday(lead.nextFollowUpDate) == true
        });

        // User-specific query
        const userQuery = {
            $or: [
                { indiaMartKey: req.user?.indiaMartKey },
                { userId: req.user?._id }
            ]
        };
        // Combine user-specific query with existing filter criteria
        const combinedQuery = { ...query, ...userQuery };

        // Get the total count of documents that match the combined filter criteria
       
        const totalLeads = await NewLeads.countDocuments(combinedQuery);
        let todayFollowUpcount = Math.ceil(todayFollowUp.length /(limit || 10))
        let pendingFollowUpcount = Math.ceil(pendingFollowUp.length /(limit || 10))
        console.log("todayFollowUpcount" ,pendingFollowUpcount, todayFollowUpcount);
        
        res.status(200).json({
            status: true,
            message: "All Leads data",
            userAllLeads: followUpOf == "pending" ? pendingFollowUp : followUpOf == "today" ? todayFollowUp : userAllLeads,
            page,
            limit: limit || 10,
            totalPages: followUpOf == "pending" ? pendingFollowUpcount : followUpOf == "today" ? todayFollowUpcount : Math.ceil(totalLeads / (limit || 10)),
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
    let leads = await NewLeads.find();
    let { searchValue } = req.query

    let userLeads = leads.filter((ld) => {
        return ld.indiaMartKey == req.user?.indiaMartKey || ld.userId == req.user?._id
    })

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
    let allLead = await NewLeads.find()
    let userAllLeads = allLead.filter((ld) => {
        return ld.indiaMartKey == req.user?.indiaMartKey || ld.userId == req.user?._id
    })
    // console.log("allLead" ,allLead);
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
            totalLeads: userAllLeads.length,
            postiveLead: postiveLead.length,
            nagetiveLead: nagetiveLead.length,
            todayFollowUp: todayFollowUp.length,
            pendingFollowUp: pendingFollowUp.length,
        }
    })
}


const getLeadsByStatus = async (req, res) => {
    let { status } = req.params
    let allLeads = await NewLeads.find()
    let userLeads = allLeads.filter((ld) => {
        return ld.indiaMartKey == req.user?.indiaMartKey || ld.userId == req.user?._id
    })
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
        let allLeads = await NewLeads.find();
        let { record } = req.query
        let userLeads = allLeads.filter((ld) => {
            return ld.indiaMartKey === req.user?.indiaMartKey || ld.userId === req.user?._id;
        });

        const currentDate = new Date();
        const previousYear = currentDate.getFullYear() - 1;
        const startOfLastYear = new Date(previousYear, 0, 1); // January 1st of last year
        const endOfLastYear = new Date(previousYear, 11, 31, 23, 59, 59); // December 31st of last year
        const userLeadIds = userLeads.map(lead => lead._id); // Get IDs of filtered leads

        // console.log(record, "<<<<<<<<Sdfsdf");
        if (record == "6months") {
            // Calculate date for 6 months ago
            const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);

            // Group filtered leads by month within the last 6 months
            const data = await NewLeads.aggregate([
                {
                    $match: {
                        _id: { $in: userLeadIds },
                        createdAt: { $gte: sixMonthsAgo, $lte: currentDate } // Filter leads from the last 6 months
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                }
            ]);

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
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
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
                    $match: { _id: { $in: userLeadIds } } // Filter by the IDs of user-specific leads
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id.year': 1, '_id.month': 1 }
                }
            ]);

            const currentYear = new Date().getFullYear();
            const allMonths = Array.from({ length: 12 }, (_, i) => ({
                _id: { year: currentYear, month: i + 1 },
                count: 0
            }));

            // Merge aggregated data with all months
            const mergedData = allMonths.map(month => {
                const found = data.find(d => d._id.year === month._id.year && d._id.month === month._id.month);
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