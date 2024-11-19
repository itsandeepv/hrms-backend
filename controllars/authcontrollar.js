const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const NewUser = require("../models/newUser");
const OtherUser = require("../models/otherUser");
const { publicUrl, formatDate } = require("../utils/createNotefication");
const { sendVerifyEmail, generateOTP, leadAssignEmail } = require("../utils/sendEmail");
const NewLeads = require("../models/leadsModel");
const moment = require("moment");
const fs = require("fs");
const { getIndiaMartKey } = require("../utils");


const register = async (req, res, next) => {
    try {
        let reqData = req.body
        const query = {
            $or: [
                { email: reqData.email },
                { companyName: reqData.companyName }
            ]
        };

        const user = await NewUser.findOne(query);
        // console.log(user?.length, "<<<<<<<adf");
        let otp = generateOTP(6)
        let otpRes = await sendVerifyEmail(reqData.email, reqData.fullName, otp);

        if (user) {
            let otp = generateOTP(6)
            await sendVerifyEmail(user.email, user.fullName, otp);

            await NewUser.findByIdAndUpdate(user?._id, {
                verifyCode: otp,
            }, { new: true })

            return res.status(409).json({
                status: false,
                isVerify: user?.isVerify || false,
                message: "User with given email/company already Exist! Please Try to login"
            });
        } else {
            if (reqData?.password) {

                bcrypt.hash(reqData.password, 10, function (error, hashPassword) {
                    if (error) {
                        res.status(500).json({
                            status: false,
                            error
                        });
                    }

                    let user = new NewUser({
                        ...reqData,
                        fullName: reqData.fullName,
                        email: reqData.email,
                        password: hashPassword,
                        userType: reqData.userType,
                        verifyCode: otp,
                        isVerify: false,
                        indiaMartKey: getIndiaMartKey()
                    });

                    // console.log(otpRes);
                    if (otpRes.accepted.length > 0) {
                        user.save().then((result) => {
                            res.status(200).send({
                                status: true,
                                message: "User Registered !",
                                user: result,
                            });
                        })
                            .catch((error) => {
                                res.status(500).json({
                                    status: false,
                                    error: error,
                                    message: "Above error aa ri hai",
                                });
                            });
                    } else {
                        res.status(500).json({
                            status: false,
                            message: "Please enter a valid email address",
                        });

                    }
                });
            } else {
                res.status(500).json({
                    status: false,
                    error: "Password is Required !",
                });
            }
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went Wrong ?",
            error
        });
    }
};



const verifyEmail = async (req, res) => {

    try {
        let { email, otp } = req.body
        const user = await NewUser.findOne({ email: email });

        console.log("user", user, otp);
        if (user) {
            if (user.verifyCode == otp) {
                let updateDetails = await NewUser.findByIdAndUpdate(user?._id, {
                    isVerify: true,
                    verifyCode: "",
                }, { new: true })
                res.status(200).json({
                    status: true,
                    message: "Opt verified "
                });
            } else {
                res.status(500).json({
                    status: true,
                    message: "Wrong Otp !"
                });
            }
        } else {
            res.status(500).json({
                status: true,
                message: "User not found ! Check your email "
            });
        }



    } catch (error) {
        res.status(500).json({
            status: false,
            error
        });
    }
}

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
                            status: true,
                            message: "New User created success",
                            user: result,
                        });
                    }).catch((error) => {
                        res.json({
                            status: false,
                            error: error,
                            message: "error ",
                        });
                    });
                });
            } else {
                res.json({
                    status: false,
                    error: "Something went Wrong ?",
                });
            }
        }
    } catch (error) {
        res.json({
            status: false,
            error,
        });
    }
}


const uploadProfileImage = async (req, res, next) => {
    try {
        const user = req.user
        let file = req.file

        const allowUser = ["company", "admin", "superadmin"]
        if (allowUser.includes(req.user?.role)) {
            if (!file) {
                return res.status(400).json({ status: false, message: 'No file uploaded' });
            }
            const img_url = `${req.protocol}://${req.get('host')}/${file.destination}${file.filename}`
            // if (type == "quotation") {
            const findUser = await NewUser.findById(user?._id)
            if (findUser) {
    
                if (findUser?.companyLogo?.url) {
                    const filePath = findUser?.companyLogo?.path;
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            return res.status(500).json({ status: false, message: 'Error deleting file from server!', error: err });
                        }
                    });
                    let updateData = await NewUser.findByIdAndUpdate(user?._id, {
                        companyLogo: {
                            fileID: 1,
                            url: img_url,
                            path: file?.path
                        }
                    }, { new: true })
                    res.status(200).json({
                        status: true,
                        message: "image file saved",
                        data: updateData?.companyLogo
    
                    })
    
                } else {
                    const updateq = await NewUser.findByIdAndUpdate(user?._id, {
                        companyLogo: {
                            fileID: 1,
                            url: img_url,
                            path: file?.path
                        }
                    }, { new: true })
                    res.status(200).json({
                        status: true,
                        message: "Image  file saved",
                        data: updateq?.companyLogo
                    })
    
                }
    
            } else {
                res.status(200).json({
                    status: false,
                    message: "Data Not found"
                })
            }

        }else{
            if (!file) {
                return res.status(400).json({ status: false, message: 'No file uploaded' });
            }
            const img_url = `${req.protocol}://${req.get('host')}/${file.destination}${file.filename}`
            // if (type == "quotation") {
            const findUser = await OtherUser.findById(user?._id)
            if (findUser) {
    
                if (findUser?.profilePic?.url) {
                    const filePath = findUser?.profilePic?.path;
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            return res.status(500).json({ status: false, message: 'Error deleting file from server!', error: err });
                        }
                    });
                    let updateData = await OtherUser.findByIdAndUpdate(user?._id, {
                        profilePic: {
                            fileID: 1,
                            url: img_url,
                            path: file?.path
                        }
                    }, { new: true })
                    res.status(200).json({
                        status: true,
                        message: "image file saved",
                        data: updateData?.profilePic
    
                    })
    
                } else {
                    const updateq = await OtherUser.findByIdAndUpdate(user?._id, {
                        profilePic: {
                            fileID: 1,
                            url: img_url,
                            path: file?.path
                        }
                    }, { new: true })
                    res.status(200).json({
                        status: true,
                        message: "Image  file saved",
                        data: updateq?.profilePic
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

const editProfile = async (req, res, next) => {
    let data = req.body

    let user = req.user
    let file = req.file
    // console.log(user, file);
    const allowUser = ["company", "admin", "superadmin"]
    
    try {
        if (allowUser.includes(req.user?.role)) {
            let img_url = ""
            if (file) {
                img_url = `${req.protocol}://${req.get('host')}/${file.destination}${file.filename}`
            }
            const findUser = await NewUser.findById(user?._id);
            if (findUser) {
                if (file) {
                    const filePath = findUser?.companyLogo?.path;
                    if (filePath) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                return res.status(500).json({ status: false, message: 'Error deleting file from server!', error: err });
                            }
                        });
                    }
                    const updatedData = await NewUser.findByIdAndUpdate(user?._id, {
                        ...data,
                        companyLogo: {
                            fileID: 1,
                            url: img_url,
                            path: file?.path
                        }
    
                    }, { new: true })
                    res.status(200).json({
                        status: true,
                        message: "Profile updated success",
                        data: updatedData
                    });
    
                }else{
                    const updatedData = await NewUser.findByIdAndUpdate(user?._id, {
                        ...data
                    }, { new: true })
                    res.status(200).json({
                        status: true,
                        message: "Profile updated success",
                        data: updatedData
                    }); 
                }
    
    
            } else {
                res.status(404).json({
                    status: false,
                    message: "User not found !",
                });
            }
    
        }else{
            const findUser = await OtherUser.findById(user?._id);
            if (findUser) {
                const updatedData = await OtherUser.findByIdAndUpdate(user?._id, {
                    ...data
                }, { new: true })
                res.status(200).json({
                    status: true,
                    message: "Profile updated success",
                    data: updatedData
                }); 
    
    
            } else {
                res.status(404).json({
                    status: false,
                    message: "User not found !",
                });
            }
        }


    } catch (error) {
        res.status(500).json({
            error: error,
            status: false
        });
    }
}




const getCompanyUser = async (req, res) => {
    try {
        let user = req.user
        const allowUser = ["company", "admin", "superadmin"]
        // if (allowUser.includes(user?.role)) {
        const AllUser = await OtherUser.find()
        const companyUser = await OtherUser.find({ companyId: allowUser.includes(user?.role) ? user?._id : user?.companyId })
        res.status(200).json({
            status: true,
            message: "Company Related user",
            companyUser: user?.role == "superadmin" ? AllUser : companyUser
        })

    } catch (error) {
        res.status(500).json({
            message: "Something went Wrong ?", error
        });
    }
}
const getAllCompany = async (req, res) => {
    try {
        let user = req.user
        const allowUser = ["superadmin"]

        if (allowUser.includes(user?.role)) {
            const data = await NewUser.find()
            // console.log("user", user);
            let formatedData = data?.map((item) => {
                let details = {
                    ...item.toObject(),
                }
                return details
            }).filter((d) => d.role != "superadmin")
            res.status(200).json({
                status: true,
                message: "Company data",
                data: formatedData,

                // :{companyName :data?.companyName }
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
            const data = await OtherUser.findByIdAndUpdate(id, {
                ...bdata
            }, { new: true })
            res.status(200).json({
                status: true,
                message: " user edit success",
                data
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
const updateCompanyStatus = async (req, res) => {
    try {
        let user = req.user
        let bdata = req.body
        let { id } = req.params
        const allowUser = ["company", "admin", "superadmin"]

        if (allowUser.includes(user?.role)) {

            if (bdata.statusChanges) {
                // if (bdata.isActive == false) {
                let findCompany = await OtherUser.find({ companyId: bdata?._id })
                const ids = findCompany.map((itm) => itm?._id)
                // console.log(bdata.statusChanges, "<<<<<<<<<Asdfa", ids);
                if (ids?.length > 0) {
                    await OtherUser.updateMany(
                        { _id: { $in: ids } },      // Filter to match multiple IDs
                        { $set: { isActive: bdata.isActive } }  // Update the isActive field
                    );
                    // console.log(bdata.statusChanges, "<<<<<<<<<Asdfa", findCompany);
                }
                // }
            }

            const data = await NewUser.findByIdAndUpdate(id, {
                ...bdata
            }, { new: true })

            res.status(200).json({
                status: true,
                message: "user edit success",
                data
            })
        } else {
            res.status(500).json({
                status: false,
                message: "Authorization Error"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Something went Wrong ?", error
        });
    }
}


//update user
const changePassword = async (req, res) => {
    let { newPassword, userId } = req.body
    let user = req.user
    try {
        if (newPassword) {
            let checkUser = await NewUser.findById(userId)
            let checkOUser = await OtherUser.findById(userId)
            if (checkOUser) {
                const hashPassword = await bcrypt.hash(newPassword, 10);
                await OtherUser.findByIdAndUpdate(userId, {
                    password: hashPassword
                }, { new: true })
                res.status(200).json({
                    status: true, hashPassword,
                    message: "Password Changed Success"
                })

            } else if (checkUser) {
                const hashPassword = await bcrypt.hash(newPassword, 10);
                await NewUser.findByIdAndUpdate(userId, {
                    password: hashPassword
                }, { new: true })
                res.status(200).json({
                    status: true, hashPassword,
                    message: "Password Changed Success"
                })

            } else {
                res.status(404).json({
                    status: false,
                    message: "User Not Found !"
                })
            }
        } else {
            res.status(404).json({
                status: false,
                message: "Password is required !"
            })
        }
    } catch (error) {
        res.status(500).json({
            error: error,
            status: false
        });
    }

}


//new user data 

const resendOtp = async (req, res) => {
    const { email, password } = req.body
    try {
        let checkadmin = await NewUser.findOne({ email: email })
        if (checkadmin) {
            let otp = generateOTP(6)
            await sendVerifyEmail(checkadmin.email, checkadmin.fullName, otp);
            await NewUser.findByIdAndUpdate(checkadmin?._id, {
                verifyCode: otp,
            }, { new: true })

            res.status(200).json({
                status: true,
                message: "Otp Resend Success !"
            });

        } else {
            res.status(500).json({
                status: false,
                message: "email not matched !"
            });

        }


    } catch (error) {
        res.status(500).json({
            status: false,
            error: error,
        });
    }

}

const loginUser = async (req, res, next) => {
    const { email, password } = req.body
    try {
        let checkadmin = await NewUser.findOne({ email: email })
        // console.log(checkadmin);
        if (checkadmin) {
            if (checkadmin?.isVerify) {
                if (checkadmin.isActive) {
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
                                        expiresIn: "7d",
                                    });
                                    res.status(200).json({
                                        status: true,
                                        message: "Login Succesfully",
                                        token: token,
                                        user: {
                                            fullName: user.fullName,
                                            indiaMartKey: user.indiaMartKey,
                                            tradeIndaiKey: user.tradeIndaiKey,
                                            mobileNumber: user.mobileNumber,
                                            companyName: user.companyName,
                                            companyLogo: user.companyLogo || "",
                                            moduleAccess: user.moduleAccess || [],
                                            address: user.address || "",
                                            userType: user.userType,
                                            companyId: user.companyId,
                                            role: user.role,
                                            _id: user._id,
                                            email: user.email,
                                            IndiaMartCrmUrl: user.IndiaMartCrmUrl,
                                            companyDetails: {
                                                name: user.companyName,
                                                address: user.address || "",
                                                email: user.email,
                                                contactNumber: user.mobileNumber,
                                                companyLogo: user.companyLogo || {},
                                                bankDetails: user.bankDetails,
                                                GSTIN: user.GSTIN,
                                                alternateEmail: user.alternateEmail || "",
                                                alternateNumber: user.alternateNumber || "",
                                                website: user.website || "",
                                            }
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
                    res.status(500).json({
                        status: false,
                        companyInactive: true,
                        message: "Company is inactive Please connect with  Technical Team !"
                    });
                }
            } else {
                let otp = generateOTP(6)
                await sendVerifyEmail(checkadmin.email, checkadmin.fullName, otp);
                await NewUser.findByIdAndUpdate(checkadmin?._id, {
                    verifyCode: otp,
                }, { new: true })

                res.status(500).json({
                    status: false,
                    verify: false,
                    message: "Please verify your email address "
                });

            }
        } else {
            let checkemployee = await OtherUser.findOne({ email: email })
            if (checkemployee.isActive) {
                const user = await OtherUser.findOne({ email: email })
                const companyDetails = await NewUser.findById(checkemployee.companyId)
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
                                    expiresIn: "7d",
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
                                        moduleAccess: user.moduleAccess || [],
                                        address: user.address || "",
                                        userType: user.userType,
                                        companyId: user.companyId,
                                        _id: user._id,
                                        role: user.role,
                                        email: user.email,
                                        companyDetails: {
                                            name: companyDetails.companyName,
                                            address: companyDetails.address || "",
                                            email: companyDetails.email,
                                            contactNumber: companyDetails.mobileNumber,
                                            companyLogo: companyDetails.companyLogo || "",
                                            bankDetails: companyDetails.bankDetails,
                                            GSTIN: companyDetails.GSTIN,
                                            alternateEmail: companyDetails.alternateEmail || "",
                                            alternateNumber: companyDetails.alternateNumber || "",
                                            website: companyDetails.website || "",
                                        },
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
            } else {
                res.status(500).json({
                    status: false,
                    companyInactive: true,
                    message: "Employee is inactive Please connect with admin !"
                });
            }

        }
    } catch (error) {
        res.status(500).json({
            status: false,
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
    // console.log(req.params);
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
            status: false,
            error: error,
        });
    }
};


// update user settings 
const getSettings = async (req, res, next) => {
    let user = req.user
    try {
        const findUser = await NewUser.findById(user?._id).lean();
        const userdata = await OtherUser.findById(user?._id).lean();
        if (findUser) {
            
            // console.log(findUser);
            const formatedData = {
                ...findUser, 
                companyDetails: {
                    name: findUser.companyName,
                    address: findUser.address || "",
                    email: findUser.email,
                    contactNumber: findUser.mobileNumber,
                    companyLogo: findUser.companyLogo || {},
                    bankDetails: findUser.bankDetails,
                    GSTIN: findUser.GSTIN,
                    alternateEmail: findUser.alternateEmail || "",
                    alternateNumber: findUser.alternateNumber || "",
                    website: findUser.website || ""
                }
            }

            res.status(200).json({
                status: true,
                message: "User Details !",
                data: formatedData
            });

        }else if(userdata){ 
            const companyData = await NewUser.findById(userdata?.companyId);
            res.status(200).json({
                status: true,
                message: "User Details !",
                data: {
                    ...userdata, 
                    companyDetails: {
                        name: companyData.companyName,
                        address: companyData.address || "",
                        email: companyData.email,
                        contactNumber: companyData.mobileNumber,
                        companyLogo: companyData.companyLogo || {},
                        bankDetails: companyData.bankDetails,
                        GSTIN: companyData.GSTIN,
                        alternateEmail: companyData.alternateEmail || "",
                        alternateNumber: companyData.alternateNumber || "",
                        website: companyData.website || "",
                    }
                }
            });
        }else {
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

// assign lead to employee api
const assignLead = async (req, res, next) => {
    // let user = req.user;
    let { leadId, employeeId } = req.body;
    const io = req.app.get('io');  // Retrieve the io instance from app context
    // console.log(leadId, io);
    try {
        // Find the user and check if the leadId already exists in the leadsAssign array
        const userdata = await OtherUser.findById(employeeId);
        if (!userdata) {
            return res.status(404).json({
                status: false,
                message: "User not found!",
            });
        } else {
            await NewLeads.findByIdAndUpdate(leadId, {
                leadAssignTo: userdata?._id || "",
                leadAssignAt: moment(new Date).format('YYYY-MM-DD HH:mm:ss')
            }, { new: true })

            let notificationDetails = {
                title: "A new lead has been assigned to you!",
                isRead: false,
                userId: userdata?._id.toString(),
                leadId: leadId,
            }
            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(notificationDetails)
            };

            // leadAssignEmail(notificationDetails)

            await fetch(`${publicUrl}/save-notification`, requestOptions).then((res) => res.json()).then((data) => {
                io.emit('leadAssigned', notificationDetails);
            }).catch((er) => {
                console.log(er);
            })
            return res.status(200).json({
                status: true,
                message: "Lead assigned successfully!",
                data: userdata
            });
        }



    } catch (error) {
        return res.status(500).json({
            error: error.message || error,
            status: false
        });
    }
}



const editSettings = async (req, res, next) => {
    let { indiaMartKey, IndiaMartCrmUrl, selectedEmployee, autoAssigning } = req.body
    let user = req.user
    try {
        const findUser = await NewUser.findById(user?._id);

        if (findUser) {
            if (autoAssigning == true || autoAssigning == false || indiaMartKey || IndiaMartCrmUrl) {
                await NewUser.findByIdAndUpdate(user?._id, {
                    autoAssigning: autoAssigning,
                    indiaMartKey: indiaMartKey,
                    IndiaMartCrmUrl: IndiaMartCrmUrl,
                }, { new: true })
                res.status(200).json({
                    status: true,
                    message: autoAssigning ? "auto Assigning enable !" : "autoAssigning disabled !",
                });
            } else if (selectedEmployee.length > 0 || selectedEmployee == 0) {
                await NewUser.findByIdAndUpdate(user?._id, {
                    selectedEmployee: selectedEmployee == 0 ? [] : selectedEmployee
                }, { new: true })
                res.status(200).json({
                    status: true,
                    message: "Settings updated Succesfully !",
                });
            } else {
                if (indiaMartKey || IndiaMartCrmUrl) {
                    await NewUser.findByIdAndUpdate(user?._id, {
                        indiaMartKey: indiaMartKey,
                        IndiaMartCrmUrl: IndiaMartCrmUrl,
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

const addLeadFields = async(req, res) => {
    try {
        const user = req.user.role === "admin" ? await NewUser.findById(req.user._id) : await OtherUser.findById(req.user._id)
        if(user){
            const index = user.leadFields?.findIndex((item) => item?.label?.toLocaleLowerCase() === req.body.label?.trim()?.toLocaleLowerCase())
            // console.log("index", index)
            if(index === -1){
                user.leadFields.push(req.body)
                await user.save()
    
                res.status(200).json({
                    status: true,
                    message: "New field added successfully.",
                    data: user.leadFields[user.leadFields.length - 1]
                })
            }else{
                res.status(200).json({
                    status: false,
                    message: "This label already exist.",
                })
            }
        }else{
            res.status(404).json({
                status: false,
                message: "User not found, please try again.",
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

const getLeadFields = async(req, res) => {
    try {
        const user = req.user.role === "admin" ? await NewUser.findById(req.user._id) : await OtherUser.findById(req.user._id)
        if(user){
            res.status(200).json({
                status: true,
                message: "Lead fields fetched successfully.",
                data: user.leadFields
            })
        }else{
            res.status(404).json({
                status: false,
                message: "User not found, please try again.",
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

const deleteLeadFields = async(req, res) => {
    try {
        // console.log("req.params.id", req.params.id)
        const user = req.user.role === "admin" ? await NewUser.findById(req.user._id) : await OtherUser.findById(req.user._id)
        if(user){
            const isFieldExist = user.leadFields.some((item) => item?._id.toString() === req.params.id)
            if(!isFieldExist){
                res.status(200).json({
                    status: false,
                    message: "This field not available",
                })
            }

            user.leadFields = user.leadFields.filter((item) => item?._id.toString() !== req.params.id)
            await user.save()
            // console.log("leadFields", user.leadFields)
            res.status(200).json({
                status: true,
                message: "Lead fields deleted successfully.",
                data: user.leadFields
            })
        }else{
            res.status(404).json({
                status: false,
                message: "User not found, please try again.",
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

const editLeadFields = async(req, res) => {
    try {
        const user = req.user.role === "admin" ? await NewUser.findById(req.user._id) : await OtherUser.findById(req.user._id)
        if(user){
            const leadField = user.leadFields.find((item) => item?._id.toString() === req.params.id)

            if (leadField) {
                const isLabelDuplicate = user.leadFields.some(
                    (item) => item._id.toString() !== req.params.id && item.label === req.body.label
                );
        
                if (isLabelDuplicate) {
                    return res.status(400).json({
                        status: false,
                        message: "This label already exist."
                    });
                }

                Object.assign(leadField, req.body);
                await user.save();

                res.status(200).json({
                    status: true,
                    message: "Lead field updated successfully.",
                    data: leadField
                });
            } else {
                res.status(404).json({
                    status: false,
                    message: "Lead field not found."
                });
            }
        }else{
            res.status(404).json({
                status: false,
                message: "User not found, please try again.",
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



module.exports = {
    register,
    loginUser,
    assignLead,
    updateUser,
    editProfile,
    createUserByAdmin,
    getCompanyUser,
    editSettings,
    deleteCompanyUser,
    editCompanyUser,
    updatePassword,
    getSettings,
    getAllCompany,
    updateCompanyStatus,
    verifyEmail,
    resendOtp,
    changePassword,
    uploadProfileImage,
    addLeadFields,
    getLeadFields,
    deleteLeadFields,
    editLeadFields
};
