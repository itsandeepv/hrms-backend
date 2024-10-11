const Quotation = require("../models/quotationModel");

const createQuotation = async(req, res, next) => {
    try {
        const user = req.user
        const data = await Quotation.create({
            ...req.body,
            companyId: user.role==="admin" ? user._id : user.companyId,
            createdBy: user._id,
        })
    
        if(data){
            res.status(200).json({
                status: true,
                message: "Quotation created successfully",
                data: data
            })
        }else{
            res.status(404).json({
                status: false,
                message: "Product not found"
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

const getQuotation = async(req, res, next) => {
    try {
        let data
        const user = req.user
        if(user.role==="employee"){
            data = await Quotation.find({createdBy: user?._id})
        }else if(user.role==="admin"){
            data = await Quotation.find({companyId: user?._id})
        }
        
        if(data){
            res.status(200).json({
                status: true,
                message: "Quotation fetched successfully",
                data: data
            })
        }else{
            res.status(404).json({
                status: false,
                message: "Quotation not found"
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

const getQuotationDetails = async(req, res, next) => {
    try {
        const {id} = req.params
        const data = await Quotation.findById(id)
        if(data){
            res.status(200).json({
                status: true,
                message: "Quotation fetched successfully.",
                data,
            })
        }else{
            res.status(404).json({
                status: false,
                message: "Quotation not found"
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

const editQuotation = async(req, res, next) => {
    try {
        const data = await Quotation.findByIdAndUpdate(req.params.id, {
            ...req.body
        }, { new: true })

        if(data){
            res.status(200).json({
                status: true,
                message: 'Quotation updated successfully.',
                data
            })
        }else{
            res.status(404).json({
                status: false,
                message: "Quotation not found"
            })
        }
    }catch(error){
        console.log('in catch', error)
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

const deleteQuotation = async(req, res, next) => {
    try {
        const {id} = req.params
        const data = await Quotation.findById(id)
        if(data){
            await Quotation.findByIdAndDelete(id)
            res.status(200).json({
                status: true,
                message: "Quotation deleted successfully."
            })
        }else{
            res.status(404).json({
                status: false,
                message: "Quotation not found"
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

module.exports = {createQuotation, getQuotation, getQuotationDetails, editQuotation, deleteQuotation}