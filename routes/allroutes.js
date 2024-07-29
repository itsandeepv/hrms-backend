const { createNewLead, getAllLead } = require("../controllars/leadscontrollar");
const { ValidateUser } = require("../middlewares/authMiddleware");

const leadsrouter = require("express").Router()


// new  user register routes
leadsrouter.post("/create-lead",ValidateUser ,createNewLead)
leadsrouter.get("/all-leads",ValidateUser ,getAllLead)
// leadsrouter.post("/login" ,loginUser)



module.exports = {leadsrouter};
