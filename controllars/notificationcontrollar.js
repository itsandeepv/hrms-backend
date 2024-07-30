const NewNotification = require("../models/notification")



const createNotification = async (req, res, next) => {

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
const getNotification = async (req, res, next) => {
    try {
        console.log(req.user);
        let allData = await NewNotification.find()
        let filterdata = allData.filter((item)=>{
            return item.userId == req.user.id ||item.indiaMartKey == req.user.indiaMartKey ||item.tradeIndaiKey == req.user.tradeIndaiKey 
        })
        res.status(200).json({
            status: true,
            message: "notefication fetch",
            data:filterdata
        })


    } catch (error) {
        res.status(500).json({
            status: false,
            message: "server error",
            error
        })
    }

}

module.exports = { deleteNotification, getNotification }