const NewLeads = require("../models/leadsModel");
const NewUser = require("../models/newUser");
const Quotation = require("../models/quotationModel");

const getQuotationId = (companyName, number) => {
    console.log("companyName", companyName.trim().split(" "))
    const companyPrefix = companyName.trim().split(" ")
        .map(word => word[0].toUpperCase())
        .join("")
        .slice(0, 3); // Get the first 3 letters if there are more

    const paddedNumber = String(number).padStart(6, '0'); // Pad the number to 6 digits

    return `QT-${companyPrefix}-${paddedNumber}`;
}

const createQuotation = async (req, res, next) => {
    try {
        const user = req.user

        let userData = await NewUser.findById(user.role === "admin" ? user._id : user.companyId)
        console.log("userData?.companyName", userData?.companyName)
        const data = await Quotation.create({
            ...req.body,
            companyId: user.role === "admin" ? user._id : user.companyId,
            createdBy: user._id,
            quotationId: getQuotationId(userData?.companyName, userData.totalQuotation + 1)
        })

        userData.totalQuotation = userData.totalQuotation + 1
        await userData.save();

        let leadData = await NewLeads.findById(req.body.leadId)
        leadData.quotationIds.push(data._id)
        await leadData.save();


        if (data) {
            res.status(200).json({
                status: true,
                message: "Quotation created successfully",
                data: data
            })
        } else {
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



const getQuotation = async (req, res, next) => {
    try {
        let data
        const user = req.user
        if (user.role === "employee") {
            data = await Quotation.find({ createdBy: user?._id }).sort({ createdAt: -1 })
        } else if (user.role === "admin") {
            data = await Quotation.find({ companyId: user?._id }).sort({ createdAt: -1 })
        }

        if (data) {
            res.status(200).json({
                status: true,
                message: "Quotation fetched successfully",
                data: data
            })
        } else {
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

const getQuotationDetails = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await Quotation.findById(id)
        if (data) {
            res.status(200).json({
                status: true,
                message: "Quotation fetched successfully.",
                data,
            })
        } else {
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

const editQuotation = async (req, res, next) => {
    // console.log("body==>", req.params.id, req.body)
    try {
        const data = await Quotation.findByIdAndUpdate(req.params.id, {
            ...req.body
        }, { new: true })

        if (data) {
            res.status(200).json({
                status: true,
                message: 'Quotation updated successfully.',
                data
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Quotation not found"
            })
        }
    } catch (error) {
        console.log('in catch', error)
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

const deleteQuotation = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await Quotation.findById(id)

        if (data) {
            let leadData = await NewLeads.findById(data.leadId)
            leadData.quotationIds = leadData.quotationIds.filter(id => id.toString() !== data._id.toString());
            await leadData.save();
            
            await Quotation.findByIdAndDelete(id)
            res.status(200).json({
                status: true,
                message: "Quotation deleted successfully."
            })
        } else {
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

module.exports = { createQuotation, getQuotation, getQuotationDetails, editQuotation, deleteQuotation }