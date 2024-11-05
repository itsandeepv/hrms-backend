const Product = require('../models/productModel');


const addProduct = async(req, res, next) => {
    const {name, price, description} = req.body
    // console.log('name', req.user?._id )
    try{
        const checkExist = await Product.findOne({name:name})
        console.log("checkExist" ,checkExist);
        if(checkExist){
            res.status(500).json({
                status: false,
                message: 'Product already exist .',
            })
        }else{
            const product = await Product.create({
                name,
                price,
                description,
                addedBy: req.user?._id
            })
            res.status(201).json({
                status: true,
                message: 'Product added successfully.',
                data: product
            })

        }
        
        
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
        // const data = await Product.find({addedBy: req.user?._id})
        let data
        const user = req.user
        if(user.role==="employee"){
            data = await Product.find({addedBy: user?.companyId})
        }else if(user.role==="admin"){
            data = await Product.find({addedBy: user?._id})
        }
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

const searchProduct = async(req, res, next) => {
    try {
        const {searchQuery} = req.query;  // Search string
        const userId = req.user?._id;  // Assuming req.user contains the logged-in user's _id

        const data = await Product.find({
            $and: [
                {addedBy: userId},
                {$or: [
                    { name: { $regex: searchQuery, $options: "i" } },
                    { price: !isNaN(searchQuery) ? Number(searchQuery) : null }
                ]}
            ]
        });

        if(data){
            res.status(200).json({
                status: true,
                message: "Search result",
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


module.exports = {addProduct, getProduct, getProductDetail, deleteProduct, editProduct, searchProduct}