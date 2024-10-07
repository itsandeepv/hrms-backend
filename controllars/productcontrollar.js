const moment = require("moment");
const Product = require("../models/productModel");

const createNewLead = async (req, res, next) => {
    let reqData = req.body

    try {
        let newLead = new Product({
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
        }
        
        // else{
        //     const userdata = await OtherUser.findById(reqData?.leadAssignTo);
        //     userdata.leadsAssign.push(createdLead?._id);
        //     await userdata.save();
        // }

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





module.exports = {
    createNewLead, getAllLead,
    deleteLead,
    editLead,
}