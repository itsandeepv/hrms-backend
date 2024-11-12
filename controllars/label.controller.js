const fs = require("fs");
const NewLabel = require("../models/labelModel");

const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters
};
const addLabel = async (req, res, next) => {
    const data = req.body
    console.log("data " ,data);
    
    try {
       
        const checkExist = await NewLabel.findOne({ name: new RegExp(`^${escapeRegExp(data?.name)}$`, 'i')  ,addedBy:req.user?._id})
        // console.log("checkExist" ,checkExist);
        if (checkExist) {
            res.status(500).json({
                status: false,
                message: 'Label already exist .',
            })
        } else {
            const Label =  NewLabel({...data ,addedBy:req.user?._id})
            await Label.save()
            res.status(201).json({
                status: true,
                message: 'Label added successfully.',
                data: Label
            })

        }


    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        })
    }
}

const editLabel = async (req, res, next) => {
    try {
        const { id } = req.params
        const updatedDetails = req.body
        const data = await NewLabel.findById(id)
        if (data) {
            const findLabel = await NewLabel.findByIdAndUpdate(id,{
                ...updatedDetails
            },{new:true})
            res.status(200).json({
                status: true,
                message: "Label edit succussfully.",
                data:findLabel
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Label not found"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
            error: error,
        })
    }
     
}

const getLabel = async (req, res, next) => {
    try {
        // const data = await Label.find({addedBy: req.user?._id})
        let data
        const user = req.user
        
        if (user.role === "employee") {
            data = await NewLabel.find({ addedBy: user?.companyId })
        } else if (user.role === "admin") {
            console.log(user);
            data = await NewLabel.find({ addedBy: user?._id?.toString() })
        }
        if (data) {
            res.status(200).json({
                status: true,
                message: 'All Labels.',
                data
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Labels not found"
            })
        }
    } catch (error) {
        res.status(error.code).json({
            status: false,
            message: error.message
        })
    }
}

const deleteLabel = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await NewLabel.findById(id)
        if (data) {
            const findLabel = await NewLabel.findByIdAndDelete(id)
            res.status(200).json({
                status: true,
                message: "Label deleted succussfully.",
                data:findLabel
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Label not found"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
            error: error,
        })
    }
}



module.exports = { addLabel, getLabel, deleteLabel, editLabel }