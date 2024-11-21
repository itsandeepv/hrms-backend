const NewLeadStatus = require("../models/addleadStatus");
const NewLeads = require("../models/leadsModel");
const LeadsUpdates = require("../models/leadsUpdateModel");
const NewNotification = require("../models/notification");
const NewStatus = require("../models/statusModel");


const createleadsUpdate = async (req, res, next) => {
    let reqData = req.body
    let { leadId } = req.params
    const io = req.app.get('io');  // Retrieve the io instance from app context

    try {
        let newLeadupdate = new LeadsUpdates({ ...reqData, leadId: leadId, userId: req.user?._id })
        let createdLeadUp = await newLeadupdate.save()
        let checkValid = await NewLeads.findById(leadId)
        if (checkValid) {
            const updatedLead = await NewLeads.findByIdAndUpdate(leadId,
                {
                    nextFollowUpDate: reqData.nextFollowUp,
                    isLeadComplete: createdLeadUp.isDealComplete,
                    dealStatus: createdLeadUp.dealStatus,
                    nextFollowUpTime: createdLeadUp?.nextFollowUpTime,
                    $push: { followupDates: createdLeadUp },
                },
                { new: true })
                
                const today = new Date().toISOString().split('T')[0];
                const nextFollowUpDate = new Date(reqData.nextFollowUp).toISOString().split('T')[0];
    
                if (nextFollowUpDate === today) {
                    io.emit("newFollowup", {
                        message: `This is a reminder for your follow-up scheduled for today with ${checkValid.senderName}`,
                        lead: updatedLead
                    });
                }

            res.status(200).json({
                status: true,
                message: "Lead updates submitted",
                createdLeadUp
            })


        } else {
            res.status(500).json({
                status: false,
                message: "Lead  not found",
            })
        }

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Lead update not created",
            error: error
        })
    }
}

const getLeadhistory = async (req, res, next) => {
    try {
        // console.log(req.user?._id);
        let leadupdatehistory = await LeadsUpdates.find({ userId: req.user?._id }).sort({ createdAt: -1 })
        res.status(200).json({
            status: true,
            message: "leads history",
            leadupdatehistory
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

const updateLeadStatus = async (req, res, next) => {
    try {
        let reqData = req.body
        let newLeadStatus = new NewStatus({ ...reqData, userId: req.user?._id })
        let leadStatusupdated = await newLeadStatus.save()
        // console.log(leadStatusupdated, "isPositive:");
        let checkValid = await NewLeads.findById(reqData.leadId)

        if (checkValid) {
            const statusExists = checkValid.leadStatus.some(status =>
                status.statusName == leadStatusupdated.statusName  // Replace statusField with the unique field to identify leadStatus
            );
            if (!statusExists) {
                await NewLeads.findByIdAndUpdate(reqData.leadId,
                    {
                        isPositiveLead: leadStatusupdated.isPositive,
                        $push: { leadStatus: leadStatusupdated },
                    },
                    { new: true })
            }
            res.status(200).json({
                status: true,
                message: "Lead status updated succuss",
                leadStatusupdated
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Lead id not found",
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

const getLeadStatus = async (req, res, next) => {
    try {
        let { leadId } = req.params
        let leadStatus = await NewStatus.find({ userId: req.user?._id, leadId: leadId })
        res.status(200).json({
            status: true,
            message: "leads status",
            leadStatus
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


// for admin new lead type or create new status 


const addNewleadStatus = async (req, res, next) => {
    try {
        let reqData = await req.body
        const {_id, role, companyId } = req.user
        // if (req.user.role == "admin") {
            const isExist = await NewLeadStatus.findOne({
                companyId: role==="admin" ? _id?.toString() : companyId ,
                leadType: reqData.leadType,
                leadStatusName: reqData.leadStatusName
            })
            if (isExist) {
                res.status(400).json({
                    status: false,
                    message: "Status already exist"
                })
            } else {
                let details = new NewLeadStatus({ 
                    ...reqData,
                    userId: _id,
                    companyId: role==="admin" ? _id.toString() : companyId
                })
                let savedData = await details.save()
                res.status(200).json({
                    status: true,
                    message: "New status created success",
                    savedData
                })
            }
        // } else {
        //     res.status(500).json({
        //         status: false,
        //         message: "Only admin/company can create new status"
        //     })
        // }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Lead type not created",
            error
        })
    }
}

const updateStatusType = async (req, res, next) => {
    let reqData = await req.body
    const {_id, role, companyId } = req.user
    const isExist = await NewLeadStatus.findOne({
        companyId: role==="admin" ? _id?.toString() : companyId,
        leadType: reqData.leadType,
        leadStatusName: reqData.leadStatusName
    })
    const findDetails = await NewLeadStatus.findById(req.params.id)
    if(isExist){
        res.status(200).json({
            status: false,
            message: "Status already exist with this name.",
        })
    }else if (findDetails) {
        await NewLeadStatus.findByIdAndUpdate(req.params.id, {
            ...req.body
        }, { new: true })
        res.status(200).json({
            status: true,
            message: "Status updated successfully",
        })
    } else {
        res.status(404).json({
            status: false,
            message: "Status not found",
        })
    }

}
const getAllStatus = async (req, res, next) => {
    const {_id, role, companyId } = req.user
    // console.log(reqUser );
    // if (["employee", "hr", "manager"].includes(reqUser?.role)) {
        const data = await NewLeadStatus.find({ companyId: role==="admin" ? _id.toString() : companyId })
        res.status(200).json({
            status: true,
            message: "All Status types",
            data
        })

    // } else {
    //     let data = await NewLeadStatus.find({ userId: reqUser?._id })
    //     // if(req.user?.role == "admin"){}
    //     res.status(200).json({
    //         status: true,
    //         message: "All Status types",
    //         data
    //     })
    // }

}

const deleteStatus = async (req, res, next) => {
    let data = await NewLeadStatus.findByIdAndDelete(req.params.id)
    // if(req.user?.role == "admin"){}
    if (data) {
        res.status(200).json({
            status: true,
            message: "Status deleted succus",
        })
    } else {
        res.status(404).json({
            status: false,
            message: "Status id not found",
        })

    }
}


const createNotification = async (req, res) => {
    try {
        let createNote = await NewNotification(req.body)
        let createdata = await createNote.save()
        res.status(200).json({
            status: true,
            message: "Message saved",
            createdata
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error,
        })
    }
    // console.log(createdata);

}

module.exports = {
    createleadsUpdate, getLeadhistory, getAllStatus,
    updateLeadStatus, getLeadStatus, addNewleadStatus,
    deleteStatus, updateStatusType, createNotification
}