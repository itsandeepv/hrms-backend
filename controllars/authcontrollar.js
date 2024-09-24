const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const NewUser = require("../models/newUser");
const OtherUser = require("../models/otherUser");
const { publicUrl, formatDate } = require("../utils/createNotefication");
const { sendVerifyEmail, generateOTP } = require("../utils/sendEmail");
const NewLeads = require("../models/leadsModel");
const moment = require("moment");


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

const getCompanyUser = async (req, res) => {
    try {
        let user = req.user
        const allowUser = ["company", "admin", "superadmin"]
        // console.log("user", user);
        if (allowUser.includes(user?.role)) {
            const AllUser = await OtherUser.find()
            const companyUser = await OtherUser.find({ companyId: user?._id })
            // const formatAllUser = AllUser.map((item) => {
            //     // const password = bcrypt.compare(currentPassword, checkUser.password || checkOUser.password);
            //     let data = {}
            //     return data
            // })
            // console.log("formatAllUser", formatAllUser);

            res.status(200).json({
                status: true,
                message: "Company Related user",
                companyUser: user?.role == "superadmin" ? AllUser : companyUser
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
    let { newPassword } = req.body
    let user = req.user
    try {
        if (newPassword) {
            let checkUser = await NewUser.findById(user?._id)
            let checkOUser = await OtherUser.findById(user?._id)
            if (checkOUser) {
                const hashPassword = await bcrypt.hash(newPassword, 10);
                await OtherUser.findByIdAndUpdate(user?._id, {
                    password: hashPassword
                }, { new: true })
                res.status(200).json({
                    status: true, hashPassword,
                    message: "Password Changed Success"
                })

            } else if (checkUser) {
                const hashPassword = await bcrypt.hash(newPassword, 10);
                await NewUser.findByIdAndUpdate(user?._id, {
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
                                            mobileNumber: user.mobileNumber,
                                            companyName: user.companyName,
                                            companyLogo: user.companyLogo || "",
                                            moduleAccuss: user.moduleAccuss || [],
                                            address: user.address || "",
                                            userType: user.userType,
                                            companyId: user.companyId,
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
                                        companyId: user.companyId,
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
                data: findUser || user
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
        }

        // Check if the leadId already exists in the leadsAssign array
        if (!userdata.leadsAssign.includes(leadId)) {
            // userdata.leadAssignTo = userdata?.fullName||""
            await NewLeads.findByIdAndUpdate(leadId, {
                leadAssignTo: userdata?._id || "",
                leadAssignAt: moment(new Date).format('YYYY-MM-DD HH:mm:ss')
            }, { new: true })
            // console.log("updateLead" ,updateLead);

            userdata.leadsAssign.push(leadId);
            await userdata.save(); // Save the updated user data
            let notificationDetails = {
                title: "A new lead has been assigned to you!",
                isRead: false,
                userId: userdata?._id,
                leadId: leadId
            }
            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(notificationDetails)
            };

            fetch(`${publicUrl}/new-notification`, requestOptions).then((res) => res.json()).then((data) => {
                io.emit('leadAssigned', notificationDetails);
            }).catch((er) => {
                console.log(er);
            })

            return res.status(200).json({
                status: true,
                message: "Lead assigned successfully!",
                data: userdata
            });
        } else {
            return res.status(200).json({
                status: true,
                message: "Lead is already assigned!",
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


const assignLeadupdate = async (req, res, next) => {
    let { leadId, newEmployeeId, oldEmployeeId } = req.body;
    try {
        const io = req.app.get('io');  // Retrieve the io instance from app context
        if (!oldEmployeeId) {
            const newUserdata = await OtherUser.findById(newEmployeeId);
            // console.log(oldEmployeeId ,newUserdata , "ADFSA");
            if (!newUserdata) {
                return res.status(404).json({
                    status: false,
                    message: "User not found!",
                });
            }
            if (newUserdata.leadsAssign.includes(leadId)) {
                // Filter out the leadId and update leadsAssign array
                newUserdata.leadsAssign = newUserdata.leadsAssign.filter((item) => item !== leadId);
                // Save the updated user data
                await newUserdata.save();
            }

            // You can add logic to assign the lead to newEmployeeId if needed.
            // For example:

            newUserdata.leadsAssign.push(leadId);
            await newUserdata.save();

            const leaddatasave = await NewLeads.findByIdAndUpdate(leadId, {
                leadAssignTo: newUserdata?._id || "",
                leadAssignAt: moment(new Date).format('YYYY-MM-DD HH:mm:ss') || ""
            }, { new: true })

            console.log(leaddatasave, moment(new Date).format('YYYY-MM-DD HH:mm:ss'), formatDate);


            let notificationDetails = {
                title: "A new lead has been assigned to you!",
                isRead: false,
                userId: newUserdata?._id,
                leadId: leadId
            }
            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(notificationDetails)
            };

            fetch(`${publicUrl}/new-notification`, requestOptions).then((res) => res.json()).then((data) => {
                io.emit('leadAssigned', notificationDetails);
            }).catch((er) => {
                console.log(er);
            })
            return res.status(200).json({
                status: true,
                message: "Lead reassigned successfully!",
                newUserdata
            });

        }

        if (newEmployeeId != oldEmployeeId) {
            const userdata = await OtherUser.findById(oldEmployeeId);
            const newUserdata = await OtherUser.findById(newEmployeeId);
            if (!userdata || !newUserdata) {
                return res.status(404).json({
                    status: false,
                    message: "User not found!",
                });
            }
            if (userdata.leadsAssign.includes(leadId)) {
                // Filter out the leadId and update leadsAssign array
                userdata.leadsAssign = userdata.leadsAssign.filter((item) => item !== leadId);
                // Save the updated user data
                await userdata.save();
            }

            // You can add logic to assign the lead to newEmployeeId if needed.
            // For example:

            newUserdata.leadsAssign.push(leadId);
            await newUserdata.save();

            const leaddatasave = await NewLeads.findByIdAndUpdate(leadId, {
                leadAssignTo: newUserdata?._id || "",
                leadAssignAt: moment(new Date).format('YYYY-MM-DD HH:mm:ss') || ""
            }, { new: true })

            console.log(leaddatasave, moment(new Date).format('YYYY-MM-DD HH:mm:ss'));


            let notificationDetails = {
                title: "A new lead has been assigned to you!",
                isRead: false,
                userId: newUserdata?._id,
                leadId: leadId
            }
            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(notificationDetails)
            };

            fetch(`${publicUrl}/new-notification`, requestOptions).then((res) => res.json()).then((data) => {
                io.emit('leadAssigned', notificationDetails);
            }).catch((er) => {
                console.log(er);
            })
            return res.status(200).json({
                status: true,
                message: "Lead reassigned successfully!",
                userdata
            });


        } else {

            return res.status(500).json({
                status: false,
                message: "both id are same !",
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            error,
        });
    }

}



const editSettings = async (req, res, next) => {
    let { indiaMartKey, IndiaMartCrmUrl, selectedEmployee, autoAssigning } = req.body
    let user = req.user
    try {
        const findUser = await NewUser.findById(user?._id);
        // console.log(findUser, selectedEmployee);
        if (findUser) {
            if (autoAssigning == true || autoAssigning == false) {
                await NewUser.findByIdAndUpdate(user?._id, {
                    autoAssigning: autoAssigning
                }, { new: true })
                res.status(200).json({
                    status: true,
                    message: autoAssigning ? "auto Assigning enable !" : "autoAssigning disabled !",
                });
            } else if(selectedEmployee.length > 0 || selectedEmployee == 0 ){
                await NewUser.findByIdAndUpdate(user?._id, {
                    selectedEmployee:selectedEmployee == 0?[]: selectedEmployee
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


module.exports = {
    register,
    loginUser,
    assignLead,
    updateUser,
    createUserByAdmin,
    getCompanyUser,
    editSettings,
    deleteCompanyUser,
    editCompanyUser,
    updatePassword,
    getSettings,
    getAllCompany,
    updateCompanyStatus,
    assignLeadupdate,
    verifyEmail,
    resendOtp,
    changePassword
};
