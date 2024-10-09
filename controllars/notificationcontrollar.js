const NewNotification = require("../models/notification");
const { leadAssignEmail } = require("../utils/sendEmail");

const saveNotification = async (req, res, next) => {
    let { leadId, userId } = req.body;
    try {
        const io = req.app.get('io');  // Retrieve the io instance from app context
        let createNote = await NewNotification({
            title: "A new lead has been assigned to you!",
            isRead: false,
            userId:userId,
            leadId: leadId
        })

        let createdata = await createNote.save()
        leadAssignEmail(createdata)
        res.status(200).json({
            status: true,
            message: "Message saved",
            createdata
        })
        io.emit('leadAssigned', createdata);
    } catch (error) {
         res.status(500).json({
            status: false,
            message: "server error",
            error
        })
    }


}


const deleteNotification = async (req, res, next) => {
    try {
        let deleteNote = await NewNotification.findByIdAndDelete(req.params.id)
        if (deleteNote) {
            res.status(200).json({
                status: true,
                message: "notefication deleted"
            })
        } else {
            res.status(404).json({
                status: false,
                message: "id not found"
            })
        }

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "server error",
            error
        })
    }

}

const deleteNotificationAll = async (req, res, next) => {
    try {
        let user =req.user
        const result = await NewNotification.deleteMany({userId:user?._id});
        if (result) {
            res.status(200).json({
                status: true,
                result,
                message: "All clear "
            })
        } else {
            res.status(404).json({
                status: false,
                message: "id not found"
            })
        }

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "server error",
            error
        })
    }

}



const getNotification = async (req, res, next) => {
    try {
        let allData = await NewNotification.find({userId:req.user?._id.toString()}).sort({ createdAt: -1 })
        res.status(200).json({
            status: true,
            message: "notification fetch",
            data:  allData 
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "server error",
            error
        })
    }

}

module.exports = {saveNotification, deleteNotification, getNotification ,deleteNotificationAll}