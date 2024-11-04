const Invoice = require("../models/invoiceModel");
const Quotation = require("../models/quotationModel");
const fs = require("fs")

const createInvoice = async (req, res, next) => {
    try {
        const user = req.user
        const data = await Invoice.create({
            ...req.body,
            companyId: user.role === "admin" ? user._id : user.companyId,
            createdBy: user._id,
        })

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
            data = await Invoice.find({ createdBy: user?._id })
        } else if (user.role === "admin") {
            data = await Invoice.find({ companyId: user?._id })
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

const getInvoiceDetails = async (req, res, next) => {
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

const editInvoice = async (req, res, next) => {
    // console.log("body==>", req.params.id, req.body)
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
        console.log('in catch', error)
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

const saveInvoiceFile = async (req, res, next) => {
    try {
        const { id, type } = req.params
        let file = req.file
        // Check if file was uploaded
        if (!file) {
            return res.status(400).json({ status: false, message: 'No file uploaded' });
        }
        const img_url = `${req.protocol}://${req.get('host')}/${file.destination}${file.filename}`
        if (type == "quotation") {
            const findQu = await Quotation.findById(id)
            if (findQu) {
                // console.log(findQu?.quotationFile?.url);
                if (findQu?.quotationFile?.url) {
                    const filePath = findQu?.quotationFile?.path;
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            return res.status(500).json({ status: false, message: 'Error deleting file from server!', error: err });
                        }
                    });
                    let updateData = await Quotation.findByIdAndUpdate(id, {
                        quotationFile: {
                            fileID: 1,
                            url: img_url,
                            path: file?.path
                        }
                    }, { new: true })
                    res.status(200).json({
                        status: true,
                        message: "Quotation file saved",
                        data: updateData?.quotationFile

                    })

                } else {
                    const updateq = await Quotation.findByIdAndUpdate(id, {
                        quotationFile: {
                            fileID: 1,
                            url: img_url,
                            path: file?.path
                        }
                    }, { new: true })
                    res.status(200).json({
                        status: true,
                        message: "Quotation file saved",
                        data: updateq?.quotationFile
                    })

                }

            } else {
                res.status(200).json({
                    status: false,
                    message: "Data Not found"
                })
            }
        }else{
            const findQu = await Invoice.findById(id)
            if (findQu) {
                // console.log(findQu?.quotationFile?.url);
                if (findQu?.invoiceFile?.url) {
                    const filePath = findQu?.invoiceFile?.path;
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            return res.status(500).json({ status: false, message: 'Error deleting file from server!', error: err });
                        }
                    });
                    let updateData = await Invoice.findByIdAndUpdate(id, {
                        invoiceFile: {
                            fileID: 1,
                            url: img_url,
                            path: file?.path
                        }
                    }, { new: true })
                    res.status(200).json({
                        status: true,
                        message: "Invoice file saved",
                        data: updateData?.invoiceFile

                    })

                } else {
                    const updateq = await Invoice.findByIdAndUpdate(id, {
                        invoiceFile: {
                            fileID: 1,
                            url: img_url,
                            path: file?.path
                        }
                    }, { new: true })
                    res.status(200).json({
                        status: true,
                        message: "Invoice file saved",
                        data: updateq?.invoiceFile
                    })

                }

            } else {
                res.status(200).json({
                    status: false,
                    message: "Data Not found"
                })
            }
        }

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
            error: error,
        })
    }
}



module.exports = { createInvoice, getInvoice, getInvoiceDetails, editInvoice, deleteInvoice, saveInvoiceFile }