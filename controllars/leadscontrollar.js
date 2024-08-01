const NewLeads = require("../models/leadsModel");
const { isToday } = require("../utils/createNotefication");


const createNewLead = async (req, res, next) => {
    let reqData = req.body
    try {
        let newLead = new NewLeads({ ...reqData, userId: req.user?._id })
        // console.log("newLead" ,reqData ,req.user ,newLead);
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
        // const isPositiveLead = req.query.isPositiveLead == 'true'; // Convert to boolean if needed

        const skip = ((page || 1) - 1) * (limit || 10);
        const query = {};
        if (leadSource) { query.leadSource = leadSource; }
        // if (isPositiveLead != undefined) { query.isPositiveLead = isPositiveLead; }

        let leads = await NewLeads.find(query).skip(skip).limit(limit || 10);
        let userAllLeads = leads.filter((ld) => {
            return ld.indiaMartKey == req.user?.indiaMartKey || ld.userId == req.user?._id
        })

        // Get the total count of user leads
        const totalLeads = await NewLeads.countDocuments({
            $or: [
                { indiaMartKey: req.user?.indiaMartKey },
                { userId: req.user?._id }
            ]
        });
        res.status(200).json({
            status: true,
            message: "All Leads data",
            userAllLeads,
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

const searchQuary = async (req,res ) => {
    let leads = await NewLeads.find();
    let { searchValue } = req.query

    let userLeads = leads.filter((ld) => {
        return ld.indiaMartKey == req.user?.indiaMartKey || ld.userId == req.user?._id
    })
    
    let filteredLead = userLeads.filter((ld)=>{
        // console.log(searchValue.toLowerCase() ,
        // ld.senderName?.toLowerCase()
        // ,ld?.senderState?.toLowerCase(),ld?.leadSource?.toLowerCase() ,);
        return ld.senderCompany?.toLowerCase().includes(searchValue.toLowerCase()) 
        || ld?.leadSource?.toLowerCase().includes(searchValue.toLowerCase())
        || ld?.senderState?.toLowerCase().includes(searchValue.toLowerCase())
        || ld?.senderName?.toLowerCase().includes(searchValue.toLowerCase())
        || ld?.senderEmail?.toLowerCase().includes(searchValue.toLowerCase())
        || ld?.senderPhone?.toLowerCase().includes(searchValue.toLowerCase())
        || ld?.uniqeQueryId?.toLowerCase().includes(searchValue.toLowerCase())
        || ld?.queryProductName?.toLowerCase().includes(searchValue.toLowerCase())
    })
    // console.log(userLeads ,filteredLead);
    res.status(200).json({
        status:true,
        message:"Query result",
        data:filteredLead
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
    let postiveLead = userAllLeads.filter((ld) => ld.isPositiveLead == true)
    let nagetiveLead = userAllLeads.filter((ld) => ld.isPositiveLead == false)
    let todayFollowUp = userAllLeads.filter(lead => isToday(lead.nextFollowUpDate));

    res.status(200).json({
        status: true,
        message: "all types leads data fetched",
        data: {
            totalLeads: userAllLeads.length,
            postiveLead: postiveLead.length,
            nagetiveLead: nagetiveLead.length,
            todayFollowUp: todayFollowUp.length,
        }
    })
}


module.exports = {
    createNewLead, getAllLead,
    getSingleLead,
    deleteLead,
    dashboardleadCount,
    editLead,
    searchQuary
}