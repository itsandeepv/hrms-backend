const { createNewLead, getAllLead, getSingleLead, deleteLead } = require("../controllars/leadscontrollar");
const { createleadsUpdate } = require("../controllars/leadsUpdatescontrollar");
const { deleteNotification, getNotification } = require("../controllars/notificationcontrollar");
const { ValidateUser } = require("../middlewares/authMiddleware");

const leadsrouter = require("express").Router()


// new  user register routes
leadsrouter.post("/create-lead",ValidateUser ,createNewLead)
leadsrouter.get("/all-leads",ValidateUser ,getAllLead)
leadsrouter.get("/lead/:id" ,ValidateUser,getSingleLead)
leadsrouter.delete("/delete-lead/:id" ,ValidateUser,deleteLead)


// user notification route
leadsrouter.delete("/delete-notefication/:id" ,ValidateUser,deleteNotification)
leadsrouter.get("/get-notefication" ,ValidateUser,getNotification)

// leads updates
leadsrouter.post("/create-leads-update/:leadId" ,ValidateUser,createleadsUpdate)


module.exports = {leadsrouter};
