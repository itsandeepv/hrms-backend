const s3uploads = require('../middlewares/s3ulpoads');
const Product = require('../models/productModel');
const fs = require("fs")
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special regex characters
};
const addProduct = async (req, res, next) => {
    const { name, price, description } = req.body
    const { _id, companyId, role } = req.user
    try {
        let img_url = {}
        const checkExist = await Product.findOne({ name: new RegExp(`^${escapeRegExp(name)}$`, 'i'), companyId: role === "admin" ? _id : companyId })
        // console.log("checkExist" ,checkExist);
        if (checkExist) {
            res.status(500).json({
                status: false,
                message: 'Product already exist .',
            })
        } else {
            if (req.files && req.files.image) {
                const file = req.files.image;
                // Generate unique file name
                const fileExtension = path.extname(file.name);
                const fileName = `${uuidv4()}${fileExtension}`;

                // Upload to S3
                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: `products/${fileName}`,
                    Body: fs.createReadStream(file.tempFilePath), // Read from temporary location
                    ContentType: file.mimetype,
                    //   ACL: 'public-read',
                };

                const uploadResponse = await s3uploads.upload(params).promise();
                img_url.url = uploadResponse.Location;
                img_url.path = uploadResponse?.key;

                // console.log("uploadResponse", uploadResponse);
                // Delete temporary file
                fs.unlinkSync(file.tempFilePath);
            }
            const product = await Product.create({
                name,
                price,
                description,
                addedBy: _id,
                companyId: role === "admin" ? _id : companyId,
                image: img_url
            })
            res.status(201).json({
                status: true,
                message: 'Product added successfully.',
                data: product
            })
        }


    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
        })
    }
}

const editProduct = async (req, res, next) => {
    try {
        // const {name, price, id} = req.body
        const data = await Product.findById(req.params.id)
        const file = req.files
        // console.log('name', file)
        let img_url = {}

        if (data) {
            if (file) {
                const filePath = data?.image?.path;
                if (filePath) {
                    const deleteParams = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: filePath,
                    };
                    await s3uploads.deleteObject(deleteParams).promise();
                }

                const newfile = req.files.image;
                // Generate a unique file name for the new image
                const fileExtension = path.extname(newfile.name);
                const fileName = `${uuidv4()}${fileExtension}`;

                // Upload the new image to S3
                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: `products/${fileName}`,
                    Body: fs.createReadStream(newfile.tempFilePath),
                    ContentType: newfile.mimetype,
                };

                const uploadResponse = await s3uploads.upload(params).promise();

                // Save the new image URL and path
                img_url = {
                    url: uploadResponse.Location,
                    path: uploadResponse.Key,
                };

                // Delete temporary file after uploading to S3
                fs.unlinkSync(newfile.tempFilePath);




                const newData = await Product.findByIdAndUpdate(req.params.id, {
                    ...req.body,
                    image: img_url
                }, { new: true })
                res.status(200).json({
                    status: true,
                    message: 'Product updated successfully.',
                    data: newData
                })

            } else {

                const newData = await Product.findByIdAndUpdate(req.params.id, {
                    ...req.body
                }, { new: true })
                res.status(200).json({
                    status: true,
                    message: 'Product updated successfully.',
                    data: newData
                })
            }
        } else {
            res.status(404).json({
                status: false,
                message: "Products not found"
            })
        }
    } catch (error) {
        res.status(error.code).json({
            status: false,
            message: error.message
        })
    }
}

const getProduct = async (req, res, next) => {
    try {
        // const data = await Product.find({addedBy: req.user?._id})
        let data
        const user = req.user
        if (user.role === "employee") {
            data = await Product.find({ companyId: user?.companyId })
            // .populate('addedBy', 'fullName')
        } else if (user.role === "admin") {
            data = await Product.find({ companyId: user?._id })
            // .populate('addedBy', 'fullName')
        }
        if (data) {
            res.status(200).json({
                status: true,
                message: 'All products.',
                data
            })
        } else {
            res.status(404).json({
                status: false,
                message: "Products not found"
            })
        }
    } catch (error) {
        res.status(error.code).json({
            status: false,
            message: error.message
        })
    }
}

const getProductDetail = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await Product.findById(id)
        // console.log('data', data)
        if (data) {
            res.status(200).json({
                status: true,
                message: 'Product details.',
                data
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
            message: error.message
        })
    }
}

const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await Product.findById(id)
        if (data) {
            const findProduct = await Product.findByIdAndDelete(id)
            const filePath = findProduct?.image?.path;

            // if (filePath) {
            //     fs.unlink(filePath, (err) => {
            //         if (err) {
            //             return res.status(500).json({ status: false, message: 'Error deleting file from server!', error: err });
            //         }
            //     });
            // }
            if (filePath) {
                const deleteParams = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: filePath,
                };
                await s3uploads.deleteObject(deleteParams).promise();
            }
            res.status(200).json({
                status: true,
                message: "Product deleted succussfully.",
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

const searchProduct = async (req, res, next) => {
    try {
        const { searchQuery } = req.query;  // Search string
        const userId = req.user?._id;  // Assuming req.user contains the logged-in user's _id

        const data = await Product.find({
            $and: [
                { addedBy: userId },
                {
                    $or: [
                        { name: { $regex: searchQuery, $options: "i" } },
                        { price: !isNaN(searchQuery) ? Number(searchQuery) : null }
                    ]
                }
            ]
        });

        if (data) {
            res.status(200).json({
                status: true,
                message: "Search result",
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


module.exports = { addProduct, getProduct, getProductDetail, deleteProduct, editProduct, searchProduct }