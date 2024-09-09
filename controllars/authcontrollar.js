const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const NewUser = require("../models/newUser");
const OtherUser = require("../models/otherUser");
const { publicUrl } = require("../utils/createNotefication");
const NewLeads = require("../models/leadsModel");
const moment = require("moment");


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
                    res.status(500).json({
                        status: false,
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
                    res.status(200).send({
                        status: true,
                        message: "New User Added Done",
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
            });
        } else {
            res.status(500).json({
                status: false,
                error: "Something went Wrong ?",
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
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
                    let data = await OtherUser.updateMany(
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

//new user data 

const loginUser = async (req, res, next) => {
    const { email, password } = req.body
    try {
        let checkadmin = await NewUser.findOne({ email: email })
        if (checkadmin) {
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
                    message: "Company is inactive Please connect with Super-Admin !"
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
    let { leadId, employeeId } = req.body;
    try {
        const userdata = await OtherUser.findById(employeeId);
        if (!userdata) {
            return res.status(404).json({
                status: false,
                message: "User not found!",
            });
        }

        if (userdata.leadsAssign.includes(leadId)) {
            // userdata.leadAssignTo = userdata?.fullName||""
            await NewLeads.findByIdAndUpdate(leadId, {
                leadAssignTo: userdata?.fullName || "",
                leadAssignAt: moment(new Date).format('YYYY-MM-DD HH:mm:ss')
            }, { new: true })
            // console.log("updateLead" ,updateLead);

            userdata.leadsAssign.filter((item)=>item != leadId);
            await userdata.save(); // 
            console.log( userdata.leadsAssign , "<<<<<<<");
            
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            error,
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
    assignLeadupdate
};
