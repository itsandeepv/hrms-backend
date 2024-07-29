const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const NewUser = require("../models/newUser");

const register = async (req, res, next) => {
    try {
        let reqData = req.body
        const user = await NewUser.findOne({ email: reqData.email });
        if (user)
            return res.status(409).json({
                status: false,
                message: "User with given email already Exist!"
            });
        if (reqData?.password) {
            bcrypt.hash(reqData.password, 10, function (error, hashPassword) {
                if (error) {
                    res.json({
                        error: error + "something went wrong !",
                    });
                }

                let user = new NewUser({
                    fullName: reqData.fullName,
                    email: reqData.email,
                    password: hashPassword,
                    userType: reqData.userType,
                });

                // console.log(user);
                user.save().then((result) => {
                    res.send({
                        message: "New User Added Done",
                        user: result,
                    });
                })
                    .catch((error) => {
                        res.json({
                            error: error,
                            message: "Above error aa ri hai",
                        });
                    });
            });
        } else {
            res.json({
                error: "Something went Wrong ?",
            });
        }
    } catch (error) {
        res.json({
            error: "Something went Wrong ?",
        });
    }
};


//new user data stated

const loginUser = async (req, res, next) => {
    const { email, password } = req.body

    try {
        await NewUser.findOne({ email: email }).then((user) => {
            if (user) {
                bcrypt.compare(password, user.password, function (error, result) {
                    if (error) {
                        res.json({
                            error: error + "Password is not match",
                        });
                    }
                    if (result) {
                        let token = jwt.sign({ id: user.id }, "SandeepIsTheKey", {
                            expiresIn: "1d",
                        });
                        res.json({
                            message: "Login Succesfully",
                            token: token,
                            user: {
                                fullName:user.fullName,
                                userType:user.userType,
                                _id:user._id,
                                email:user.email,
                            },
                        });
                    } else {
                        res.json({ error: "Wrong email and password !" });
                    }
                });
            } else {
                res.json({
                    message: "Please Check Your Email And Password !",
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            error: error,
        });
    }
};

const loginAdmin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        NewUser.findOne({ email: email }).then((user) => {

            if (user?.user_type != "admin") {
                res.json({
                    message: "Usertype is not valid",
                });
            }
            if (user) {
                bcrypt.compare(password, user.password, function (error, result) {
                    if (error) {
                        res.json({
                            error: error + "Password is not match",
                        });
                    }
                    if (result) {
                        let token = jwt.sign({ id: user.id }, "SandeepIsTheKey", {
                            expiresIn: "1d",
                        });
                        res.json({
                            message: "Login Succesfully",
                            token: token,
                            user: user,
                        });
                    } else {
                        res.json({ error: "Wrong email and password !" });
                    }
                });
            } else {
                res.json({
                    message: "Please Check Your Email And Password !",
                });
            }
        });
    } catch (error) {
        res.status(500).json({
            error: error,
        });
    }
};






const get_user = async (req, res, next) => {
    try {
        const users = await NewUser.find();
        res.status(200).json({
            users,
        });
    } catch (error) {
        res.status(500).json({
            error: error,
        });
    }
};
//get a single user
const getSingle_user = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(404).json({
                message: "User Is not Find Please Check Once !",
            });
        }

        console.log(id);
        const getUserInfo = await NewUser.findById(id);

        if (getUserInfo) {
            res.status(200).json({
                getUserInfo,
            });
        }
    } catch (error) {
        res.status(500).json({
            error: error,
        });
    }
};
//update user

const updateUser = async (req, res) => {
    const { id } = req.params;
    console.log(req.params);
    try {
        const hashPassword = await bcrypt.hash(req.body.password, 10);
        let updateUser = await NewUser.findByIdAndUpdate(
            id,
            {
                firstName: req?.body?.firstName,
                lastName: req?.body?.lastName,
                mobile_number: req?.body?.mobile_number,
                email: req?.body?.email,
                address: req?.body?.address,
                password: hashPassword,
                user_type: req?.body?.user_type,
                profilePic: req?.file?.filename,
            },
            {
                new: true,
            }
        );
        res.status(200).json({
            message: "User Updated succesfully ",
            updateUser,
        });
    } catch (error) {
        res.status(500).json({
            error: error,
        });
    }
};

//delete user
const delete_user = async (req, res) => {
    try {
        const { id } = req.params;
        await NewUser.findByIdAndDelete(id);
        res.status(200).json({
            status:true,
            message: "User Deleted Succesfully !",
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            status:false
        });
    }
};

module.exports = {
    register,
    loginUser,
    get_user,
    getSingle_user,
    delete_user,
    updateUser,
    loginAdmin,
};
