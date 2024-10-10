const Quotation = require("../models/quotationModel");

const createQuotation = async(req, res, next) => {
    try {
        const data = await Quotation.create({
            companyId: req.user.companyId,
            createdBy: req.user._id,
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
        const data = await Quotation.find({createdBy: req.user?._id})
        
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

module.exports = {createQuotation, getQuotation}