
const jwt = require('jsonwebtoken');
const NewUser = require('../models/newUser');

const ValidateUser = async (req, res, next) => {
    const headertoken = await req.headers.authorization
    try {
        if (headertoken == undefined) { res.status(500).json({
            status:false,
             message: "Invalid authorization provide token"
             }) }
        var [bearerKeyword, token] = headertoken.split(' ');
        if (bearerKeyword.toLowerCase() === 'bearer' && token) {
            var decodedtoken = jwt.verify(token, "SandeepIsTheKey");
            console.log(decodedtoken);
            // SandeepIsTheKey
        } else {
            res.status(500).json({status:false, message: " unauthorization token" })
        }
        const findedUser = await NewUser.findById(decodedtoken.id)
        // console.log( findedUser ,"<<<<");
        if(findedUser){
            req.user = findedUser;
        }else{
            res.status(404).json({status:false,message:"User Not found !"})
        }
        next()
        
    } catch (error) {
        res.status(500).json({ error: error, });
    }
};

module.exports = {ValidateUser}
