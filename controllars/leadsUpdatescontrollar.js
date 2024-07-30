const NewLeads = require("../models/leadsModel");
const LeadsUpdates = require("../models/leadsUpdateModel");


const createleadsUpdate = async (req, res, next) => {
    let reqData = req.body
    let {leadId} = req.params

    try {
        let newLeadupdate = new LeadsUpdates({ ...reqData,leadId:leadId, userId: req.user?._id })
        let createdLeadUp = await newLeadupdate.save()
        res.status(200).json({
            status: true,
            message: "Lead updates submitted",
            createdLeadUp
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Lead update not created",
            error: error
        })
    }
}

const getAllLead = async (req, res, next) => {
    try {
        // console.log(req.user?._id);
        let leads = await NewLeads.find({ userId: req.user?._id })
        res.status(200).json({
            status: true,
            message: " All Leads data",
            leads
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
        // console.log(lead ,id);
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
        // console.log(error);
        res.status(500).json({
            status: false,
            message: "Server Error",
            error: error
        })
    }
}



module.exports = { createleadsUpdate, getAllLead, getSingleLead ,deleteLead }