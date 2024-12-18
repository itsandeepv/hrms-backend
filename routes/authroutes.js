const authrouter = require("express").Router()
const { register, loginUser,verifyEmail, createUserByAdmin, getCompanyUser, editSettings, deleteCompanyUser, editCompanyUser, updatePassword, getSettings, getAllCompany, updateCompanyStatus, assignLead, resendOtp, changePassword, uploadProfileImage, editProfile, assignMultipleLead } = require("../controllars/authcontrollar")
const { getAllRoles } = require("../controllars/moduleAccess.controller")
const { ValidateUser } = require("../middlewares/authMiddleware")
// new  user register routes
authrouter.post("/register" ,register)
authrouter.post("/create-user" , ValidateUser,createUserByAdmin)
authrouter.post("/update-image" , ValidateUser,uploadProfileImage)
authrouter.post("/edit-profile" , ValidateUser ,editProfile)
authrouter.get("/get-company-user" , ValidateUser,getCompanyUser)
authrouter.delete("/delete-company-user/:id" , ValidateUser,deleteCompanyUser)
authrouter.put("/update-company-status/:id" , ValidateUser,updateCompanyStatus)
authrouter.put("/edit-company-user/:id" , ValidateUser,editCompanyUser)
authrouter.put("/update-password" , ValidateUser,updatePassword)
authrouter.put("/change-password" , ValidateUser,changePassword)
authrouter.put("/settings" , ValidateUser,editSettings)
authrouter.get("/settings" , ValidateUser,getSettings)
authrouter.post("/assign-lead" , ValidateUser,assignLead)
authrouter.post("/assign-multiple-lead" , ValidateUser,assignMultipleLead)
authrouter.post("/auto-assign-lead" ,assignLead)
authrouter.put("/verify-email" ,verifyEmail)
authrouter.put("/resend-otp" ,resendOtp)
authrouter.get("/all-company" , ValidateUser,getAllCompany)
authrouter.get("/all-roles" , ValidateUser,getAllRoles)
authrouter.post("/login" ,loginUser)



module.exports = {authrouter};
