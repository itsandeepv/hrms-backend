const Invoice = require("../models/invoiceModel");
const NewLeads = require("../models/leadsModel");
const NewUser = require("../models/newUser");
const Quotation = require("../models/quotationModel");
const fs = require("fs")

const getInvoiceId = (companyName, number) => {
    const companyPrefix = companyName.trim().split(" ")
        .map(word => word[0].toUpperCase())
        .join("")
        .slice(0, 3); // Get the first 3 letters if there are more

    const paddedNumber = String(number).padStart(6, '0'); // Pad the number to 6 digits

    return `I-${companyPrefix}-${paddedNumber}`;
}

const createInvoice = async (req, res, next) => {
    try {
        const user = req.user

        let userData = await NewUser.findById(user.role === "admin" ? user._id : user.companyId)
        const data = await Invoice.create({
            ...req.body,
            companyId: user.role === "admin" ? user._id : user.companyId,
            createdBy: user._id,
            invoiceId: getInvoiceId(userData?.companyName, userData.totalInvoice + 1)
        })

        userData.totalInvoice = userData.totalInvoice + 1
        await userData.save();

        let leadData = await NewLeads.findById(req.body.leadId)
        leadData.invoiceIds.push(data._id)
        await leadData.save();

        if (data) {
            res.status(200).json({
                status: true,
                message: "Invoice created successfully",
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



const getInvoice = async (req, res, next) => {
    try {
        let data
        const user = req.user
        if (user.role === "employee") {
            data = await Invoice.find({ createdBy: user?._id }).sort({ createdAt: -1 })
        } else if (user.role === "admin") {
            data = await Invoice.find({ companyId: user?._id }).sort({ createdAt: -1 })
        }

        if (data) {
            res.status(200).json({
                status: true,
                message: "Invoice fetched successfully",
                data: data
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Invoice not found"
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

const getInvoiceDetails = async (req, res) => {
    try {
        const { id } = req.params
        const data = await Invoice.findById(id)
        if (data) {
            res.status(200).json({
                status: true,
                message: "Invoice fetched successfully.",
                data,
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Invoice not found"
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

const editInvoice = async (req, res) => {
    try {
        const data = await Invoice.findByIdAndUpdate(req.params.id, {
            ...req.body
        }, { new: true })

        if (data) {
            res.status(200).json({
                status: true,
                message: 'Invoice updated successfully.',
                data
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Invoice not found"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

const deleteInvoice = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await Invoice.findById(id)
        
        if (data) {
            let leadData = await NewLeads.findById(data.leadId)
            leadData.invoiceIds = leadData.invoiceIds.filter(id => id.toString() !== data._id.toString());
            await leadData.save();
            
            await Invoice.findByIdAndDelete(id)
            res.status(200).json({
                status: true,
                message: "Invoice deleted successfully."
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Invoice not found"
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

module.exports = { createInvoice, getInvoice, getInvoiceDetails, editInvoice, deleteInvoice }