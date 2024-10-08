const Product = require('../models/productModel');


const addProduct = async(req, res, next) => {
    const {name, price} = req.body
    // console.log('name', req.user?._id )
    try{
        const product = await Product.create({
            name,
            price,
            addedBy: req.user?._id
        })
        res.status(201).json({
            status: true,
            message: 'Product added successfully.',
            data: product
        })
    }catch(error){
        res.status(500).json({
            status: false,
            message: error.message,
        })
    }
}

const editProduct = async(req, res, next) => {
    try{
        // const {name, price, id} = req.body
        const data = await Product.findById(req.params.id)

        if(data){
            const newData = await Product.findByIdAndUpdate(req.params.id, {
                ...req.body
            }, { new: true })
            res.status(200).json({
                status: true,
                message: 'Product updated successfully.',
                data: newData
            })
        }else{
            res.status(404).json({
                status: false,
                message: "Products not found"
            })
        }
    }catch(error){
        res.status(error.code).json({
            status: false,
            message: error.message
        })
    }
}

const getProduct = async(req, res, next) => {
    try{
        const data = await Product.find({addedBy: req.user?._id})
        if(data){
            res.status(200).json({
                status: true,
                message: 'All products.',
                data
            })
        }else{
            res.status(404).json({
                status: false,
                message: "Products not found"
            })
        }
    }catch(error){
        res.status(error.code).json({
            status: false,
            message: error.message
        })
    }
}

const getProductDetail = async(req, res, next) => {
    try{
        const { id } = req.params
        const data = await Product.findById(id)
        console.log('data', data)
        if(data){
            res.status(200).json({
                status: true,
                message: 'Product details.',
                data
            })
        }else{
            res.status(404).json({
                status: false,
                message: "Product not found"
            })
        }
    }catch(error){
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

const deleteProduct = async(req, res, next) => {
    try{
        const { id } = req.params
        const data = await Product.findById(id)
        if(data){
            await Product.findByIdAndDelete(id)
            res.status(200).json({
                status: true,
                message: "Product deleted succussfully.",
            })
        }else{
            res.status(404).json({
                status: false,
                message: "Product not found"
            })
        }
    }catch(error){
        res.status(500).json({
            status: false,
            message: error.message,
            error: error,
        })
    }
}


module.exports = {addProduct, getProduct, getProductDetail, deleteProduct, editProduct}