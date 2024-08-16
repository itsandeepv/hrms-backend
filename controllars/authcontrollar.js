const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const NewUser = require("../models/newUser");
const OtherUser = require("../models/otherUser");

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
                    ...reqData,
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
            message: "Something went Wrong ?",
            error
        });
    }
};

const createUserByAdmin = async (req, res, next) => {
    try {
        let reqData = req.body
        const allowUser = ["company", "admin", "superadmin"]
        if (!allowUser.includes(req.user?.role)) {
            res.status(500).json({
                status: false,
                message: "Admin/company can create new user !"
            })
            return
        } else {
            const user = await OtherUser.findOne({ email: reqData.email });
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
                    let user = new OtherUser({
                        ...reqData,
                        adminId: req.user?._id || reqData.adminId,
                        indiaMartKey: req.user?.indiaMartKey || reqData.indiaMartKey,
                        tradeIndaiKey: req.user?.tradeIndaiKey || reqData.tradeIndaiKey,
                        password: hashPassword,
                    });

                    // console.log(user);
                    user.save().then((result) => {
                        res.send({
                            message: "New User created success",
                            user: result,
                        });
                    }).catch((error) => {
                        res.json({
                            error: error,
                            message: "error ",
                        });
                    });
                });
            } else {
                res.json({
                    error: "Something went Wrong ?",
                });
            }
        }
    } catch (error) {
        res.json({
            error: "Something went Wrong ?",
        });
    }
}

const getCompanyUser = async (req, res) => {
    try {
        let user = req.user
        const allowUser = ["company", "admin", "superadmin"]
        console.log("user", user);

        if (allowUser.includes(user?.role)) {
            const companyUser = await OtherUser.find({ adminId: user?._id })
            res.status(200).json({
                status: true,
                message: "Company Related user",
                companyUser
            })
        } else {
            res.status(500).json({
                status: false,
                message: "Authorization Error"
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Something went Wrong ?", error
        });
    }
}

const deleteCompanyUser = async (req, res) => {
    try {
        let user = req.user
        let { id } = req.params
        const allowUser = ["company", "admin", "superadmin"]

        if (allowUser.includes(user?.role)) {
            const deletedUser = await OtherUser.findByIdAndDelete(id)
            res.status(200).json({
                status: true,
                message: " user deleted success",
                deletedUser
            })
        } else {
            res.status(500).json({
                status: false,
                message: "Authorization Error"
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Something went Wrong ?", error
        });
    }
}
const editCompanyUser = async (req, res) => {
    try {
        let user = req.user
        let bdata = req.body
        let { id } = req.params
        const allowUser = ["company", "admin", "superadmin"]

        if (allowUser.includes(user?.role)) {
            const deletedUser = await OtherUser.findByIdAndUpdate(id, {
                ...bdata
            }, { new: true })
            res.status(200).json({
                status: true,
                message: " user edit success",
                deletedUser
            })
        } else {
            res.status(500).json({
                status: false,
                message: "Authorization Error"
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Something went Wrong ?", error
        });
    }
}

//new user data 

const loginUser = async (req, res, next) => {
    const { email, password } = req.body
    try {
        let checkadmin = await NewUser.findOne({ email: email })
        if (checkadmin) {
            await NewUser.findOne({ email: email }).then((user) => {
                if (user) {
                    bcrypt.compare(password, user.password, function (error, result) {
                        if (error) {
                            res.status(500).json({
                                status: false,
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
                                    fullName: user.fullName,
                                    indiaMartKey: user.indiaMartKey,
                                    tradeIndaiKey: user.tradeIndaiKey,
                                    mobileNumber: user.mobileNumber,
                                    companyName: user.companyName,
                                    companyLogo: user.companyLogo || "",
                                    moduleAccuss: user.moduleAccuss || [],
                                    address: user.address || "",
                                    userType: user.userType,
                                    role: user.role,
                                    _id: user._id,
                                    email: user.email,
                                    IndiaMartCrmUrl: user.IndiaMartCrmUrl,
                                },
                            });
                        } else {
                            res.status(404).json({
                                status: false, error: "Wrong email and password !"
                            });
                        }
                    });
                } else {
                    res.status(400).json({
                        status: false,
                        message: "Please Check Your Email And Password !",
                    });
                }
            });
        } else {
            await OtherUser.findOne({ email: email }).then((user) => {
                if (user) {
                    bcrypt.compare(password, user.password, function (error, result) {
                        if (error) {
                            res.status(400).json({
                                status: false,
                                error: error + "Password is not match",
                            });
                        }
                        if (result) {
                            let token = jwt.sign({ id: user.id }, "SandeepIsTheKey", {
                                expiresIn: "1d",
                            });
                            res.status(200).json({
                                status: true,
                                message: "Login Succesfully",
                                token: token,
                                user: {
                                    fullName: user.fullName,
                                    indiaMartKey: user.indiaMartKey,
                                    tradeIndaiKey: user.tradeIndaiKey,
                                    adminId: user.adminId,
                                    permissions: user.permissions || [],
                                    mobileNumber: user.mobileNumber,
                                    companyName: user.companyName,
                                    companyLogo: user.companyLogo || "",
                                    moduleAccuss: user.moduleAccuss || [],
                                    address: user.address || "",
                                    userType: user.userType,
                                    _id: user._id,
                                    role: user.role,
                                    email: user.email,
                                },
                            });
                        } else {
                            res.status(400).json({
                                status: false, error: "Wrong email and password !"
                            });
                        }
                    });
                } else {
                    res.status(400).json({
                        status: false,
                        message: "Please Check Your Email And Password !",
                    });
                }
            });

        }
    } catch (error) {
        res.status(500).json({
            status: false,
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


const updatePassword = async (req, res) => {
    let { newPassword, currentPassword } = req.body
    let user = req.user
    try {
        let checkUser = await NewUser.findById(user?._id)
        let checkOUser = await OtherUser.findById(user?._id)
        if (checkOUser) {
            const isMatch = await bcrypt.compare(currentPassword, checkUser.password || checkOUser.password);
            if (isMatch) {
                const hashPassword = await bcrypt.hash(newPassword, 10);
                // console.log(hashPassword, currentPassword, "<<<<<<<Adf");
                await OtherUser.findByIdAndUpdate(user?._id, {
                    password: hashPassword
                }, { new: true })
                res.status(200).json({
                    status: true,
                    message: "Password updated"
                })
            } else {
                res.status(404).json({
                    status: false,
                    message: "Old password is not matched !"
                })
            }
        } else if (checkUser) {
            const isMatch = await bcrypt.compare(currentPassword, checkUser.password || checkOUser.password);
            if (isMatch) {
                const hashPassword = await bcrypt.hash(newPassword, 10);
                // console.log(hashPassword ,currentPassword , "<<<<<<<Adf");
                await NewUser.findByIdAndUpdate(user?._id, {
                    password: hashPassword
                }, { new: true })
                res.status(200).json({
                    status: true,
                    message: "Password updated"
                })
            } else {
                res.status(404).json({
                    status: false,
                    message: "Old password is not matched !"
                })
            }
        } else {
            res.status(404).json({
                status: false,
                message: "User Not Found !"
            })
        }
    } catch (error) {
        res.status(500).json({
            error: error,
            status: false
        });
    }

}

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
            status: true,
            message: "User Deleted Succesfully !",
        });
    } catch (error) {
        res.status(500).json({
            error: error,
            status: false
        });
    }
};


// update user settings 
const getSettings = async (req, res, next) => {
    let { indiaMartKey, IndiaMartCrmUrl } = req.body
    let user = req.user
    try {
        const findUser = await NewUser.findById(user?._id);
        const userdata = await OtherUser.findById(user?._id);
        // console.log(findUser);
        if (findUser || userdata) {
            res.status(200).json({
                status: true,
                message: "User Details !",
                data :findUser || user
            });

        } else {
            res.status(404).json({
                status: false,
                message: "User not found !",
            });
        }


    } catch (error) {
        res.status(500).json({
            error: error,
            status: false
        });
    }
}


const editSettings = async (req, res, next) => {
    let { indiaMartKey, IndiaMartCrmUrl } = req.body
    let user = req.user
    try {
        const findUser = await NewUser.findById(user?._id);
        // console.log(findUser);
        if (findUser) {
            if (indiaMartKey || IndiaMartCrmUrl) {
                await NewUser.findByIdAndUpdate(user?._id, {
                    indiaMartKey: indiaMartKey,
                    IndiaMartCrmUrl: IndiaMartCrmUrl
                }, { new: true })

                res.status(200).json({
                    status: true,
                    message: "Settings updated Succesfully !",
                });
            } else {
                res.status(400).json({
                    status: false,
                    message: "indiaMartKey IndiaMartCrmUrl both are required",
                });
            }

        } else {
            res.status(404).json({
                status: false,
                message: "User not found !",
            });
        }


    } catch (error) {
        res.status(500).json({
            error: error,
            status: false
        });
    }
}

module.exports = {
    register,
    loginUser,
    get_user,
    getSingle_user,
    delete_user,
    updateUser,
    loginAdmin,
    createUserByAdmin,
    getCompanyUser,
    editSettings,
    deleteCompanyUser,
    editCompanyUser,
    updatePassword,
    getSettings
};
