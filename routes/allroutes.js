const { createNewLead, getAllLead, getSingleLead, deleteLead, dashboardleadCount, editLead, searchQuary, getLeadsByStatus, getChartDetails, bulkLeadInset } = require("../controllars/leadscontrollar");
const { createleadsUpdate, getLeadhistory, updateLeadStatus, getLeadStatus, addNewleadStatus, getAllStatus, deleteStatus, updateStatusType, createNotification } = require("../controllars/leadsUpdatescontrollar");
const { addProduct, getProduct, getProductDetail, deleteProduct, editProduct, searchProduct } = require("../controllars/product.controller");
const { deleteNotification, getNotification, deleteNotificationAll, saveNotification } = require("../controllars/notificationcontrollar");
const { ValidateUser } = require("../middlewares/authMiddleware");
const { createQuotation, getQuotation } = require("../controllars/quotation.controller");

const leadsrouter = require("express").Router()


// new  user register routes
leadsrouter.post("/create-lead",ValidateUser ,createNewLead)
leadsrouter.get("/all-leads",ValidateUser ,getAllLead)
leadsrouter.post("/leads/bulk-insert",ValidateUser ,bulkLeadInset)
leadsrouter.get("/lead/:id" ,ValidateUser,getSingleLead)
leadsrouter.delete("/delete-lead/:id" ,ValidateUser,deleteLead)
leadsrouter.put("/update-lead/:id" ,ValidateUser,editLead)


// user notification route
leadsrouter.delete("/delete-notefication/:id" ,ValidateUser,deleteNotification)
leadsrouter.delete("/clear-all" ,ValidateUser,deleteNotificationAll)
leadsrouter.post("/save-notification" ,saveNotification)
leadsrouter.post("/new-notification" ,createNotification)
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

//product 
leadsrouter.post("/add-product", ValidateUser, addProduct)
leadsrouter.get("/get-product", ValidateUser, getProduct)
leadsrouter.get("/get-product-detail/:id", ValidateUser, getProductDetail)
leadsrouter.get("/delete-product/:id", ValidateUser, deleteProduct)
leadsrouter.post("/edit-product/:id", ValidateUser, editProduct)
leadsrouter.get("/search-product", ValidateUser, searchProduct)

leadsrouter.post("/create-quotation", ValidateUser, createQuotation)
leadsrouter.get("/get-quotation", ValidateUser, getQuotation)

module.exports = {leadsrouter};
