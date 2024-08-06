const { createNewLead, getAllLead, getSingleLead, deleteLead, dashboardleadCount, editLead, searchQuary, getLeadsByStatus, getChartDetails } = require("../controllars/leadscontrollar");
const { createleadsUpdate, getLeadhistory, updateLeadStatus, getLeadStatus, addNewleadStatus, getAllStatus, deleteStatus, updateStatusType } = require("../controllars/leadsUpdatescontrollar");
const { deleteNotification, getNotification } = require("../controllars/notificationcontrollar");
const { ValidateUser } = require("../middlewares/authMiddleware");

const leadsrouter = require("express").Router()


// new  user register routes
leadsrouter.post("/create-lead",ValidateUser ,createNewLead)
leadsrouter.get("/all-leads",ValidateUser ,getAllLead)
leadsrouter.get("/lead/:id" ,ValidateUser,getSingleLead)
leadsrouter.delete("/delete-lead/:id" ,ValidateUser,deleteLead)
leadsrouter.put("/update-lead/:id" ,ValidateUser,editLead)


// user notification route
leadsrouter.delete("/delete-notefication/:id" ,ValidateUser,deleteNotification)
leadsrouter.get("/get-notefication" ,ValidateUser,getNotification)

// leads updates
leadsrouter.post("/create-leads-update/:leadId" ,ValidateUser,createleadsUpdate)
leadsrouter.get("/get-leads-history" ,ValidateUser,getLeadhistory)


// lead status updates (postive /nagetive)
leadsrouter.post("/leads-status-update" ,ValidateUser,updateLeadStatus)
leadsrouter.get("/get-leads-status/:leadId" ,ValidateUser,getLeadStatus)


// create status types
leadsrouter.post("/add-status" ,ValidateUser,addNewleadStatus)
leadsrouter.get("/get-status" ,ValidateUser,getAllStatus)
leadsrouter.delete("/delete-status/:id" ,ValidateUser,deleteStatus)
leadsrouter.put("/update-status/:id" ,ValidateUser,updateStatusType)

// home page api routes
leadsrouter.get("/get-lead-by-count" ,ValidateUser,dashboardleadCount)
leadsrouter.get("/search" ,ValidateUser,searchQuary)
leadsrouter.get("/home-leads/:status" ,ValidateUser,getLeadsByStatus)
leadsrouter.get("/chart" ,ValidateUser,getChartDetails)

module.exports = {leadsrouter};
