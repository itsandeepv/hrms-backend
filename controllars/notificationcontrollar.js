const NewNotification = require("../models/notification")




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
        let query = {}
        let role = ["employee", "hr", "manager"].includes(req.user?.role)
        if (role) {
            query.userId = req.user?._id
        }

        let allData = await NewNotification.find(query).sort({ createdAt: -1 })
        // console.log(query);
        let filterdata = allData.filter((item) => {
            return item.userId == req.user?._id || item.indiaMartKey == req.user.indiaMartKey || item.tradeIndaiKey == req.user.tradeIndaiKey
        })

        res.status(200).json({
            status: true,
            message: "notification fetch",
            data: role ? allData : filterdata
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "server error",
            error
        })
    }

}

module.exports = { deleteNotification, getNotification ,deleteNotificationAll}