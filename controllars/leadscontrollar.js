const NewLeads = require("../models/leadsModel");


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
        console.log(error);
        res.status(500).json({
            status: false,
            message: "Lead not created",
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



module.exports = { createNewLead, getAllLead, getSingleLead ,deleteLead }