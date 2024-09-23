const authrouter = require("express").Router()
const { register, loginUser,verifyEmail, createUserByAdmin, getCompanyUser, editSettings, deleteCompanyUser, editCompanyUser, updatePassword, getSettings, getAllCompany, updateCompanyStatus, assignLead, getAllemployee, assignLeadupdate, resendOtp, changePassword } = require("../controllars/authcontrollar")
const { ValidateUser } = require("../middlewares/authMiddleware")


// new  user register routes
authrouter.post("/register" ,register)
authrouter.post("/create-user" , ValidateUser,createUserByAdmin)
authrouter.get("/get-company-user" , ValidateUser,getCompanyUser)
authrouter.delete("/delete-company-user/:id" , ValidateUser,deleteCompanyUser)
authrouter.put("/update-company-status/:id" , ValidateUser,updateCompanyStatus)
authrouter.put("/edit-company-user/:id" , ValidateUser,editCompanyUser)
authrouter.put("/update-password" , ValidateUser,updatePassword)
authrouter.put("/change-password" , ValidateUser,changePassword)
authrouter.put("/settings" , ValidateUser,editSettings)
authrouter.get("/settings" , ValidateUser,getSettings)
authrouter.post("/assign-lead" , ValidateUser,assignLead)
authrouter.post("/auto-assign-lead" ,assignLead)
authrouter.put("/verify-email" ,verifyEmail)
authrouter.put("/resend-otp" ,resendOtp)
authrouter.put("/update-assign-lead" , ValidateUser,assignLeadupdate)
authrouter.get("/all-company" , ValidateUser,getAllCompany)
authrouter.post("/login" ,loginUser)



module.exports = {authrouter};
