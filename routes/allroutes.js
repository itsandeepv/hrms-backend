const { createNewLead, getAllLead, getSingleLead, deleteLead, dashboardleadCount, editLead, searchQuary, getLeadsByStatus, getChartDetails, bulkLeadInset, getJustdialLead, getIndiamartLead } = require("../controllars/leadscontrollar");
const { createleadsUpdate, getLeadhistory, updateLeadStatus, getLeadStatus, addNewleadStatus, getAllStatus, deleteStatus, updateStatusType, createNotification } = require("../controllars/leadsUpdatescontrollar");
const { addProduct, getProduct, getProductDetail, deleteProduct, editProduct, searchProduct } = require("../controllars/product.controller");
const { deleteNotification, getNotification, deleteNotificationAll, saveNotification, readNotification } = require("../controllars/notificationcontrollar");
const { ValidateUser } = require("../middlewares/authMiddleware");
const { createQuotation, getQuotation, deleteQuotation, getQuotationDetails, editQuotation } = require("../controllars/quotation.controller");
const { createInvoice, getInvoice, getInvoiceDetails, editInvoice, deleteInvoice } = require("../controllars/invoice.controller");
const {addRole, addModule, getModule, editModule, deleteModule, editModuleAccessibility} = require("../controllars/moduleAccess.controller")
const uploadImage = require("../middlewares/uploadImage");
const { addLabel, getLabel, deleteLabel, editLabel } = require("../controllars/label.controller");
const { addLeadFields, getLeadFields, deleteLeadFields, editLeadFields } = require("../controllars/authcontrollar");
const { addSource, getSource, deleteSource, editSource, editSourceAccessibility } = require("../controllars/source.controller");

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
leadsrouter.put("/read-notification" ,ValidateUser, readNotification)

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
leadsrouter.post("/add-product", ValidateUser,uploadImage.single("image"), addProduct)
leadsrouter.get("/get-product", ValidateUser, getProduct)
leadsrouter.get("/get-product-detail/:id", ValidateUser, getProductDetail)
leadsrouter.get("/delete-product/:id", ValidateUser, deleteProduct)
leadsrouter.post("/edit-product/:id", ValidateUser,uploadImage.single("image"), editProduct)
leadsrouter.get("/search-product", ValidateUser, searchProduct)

leadsrouter.post("/create-quotation", ValidateUser, createQuotation)
leadsrouter.get("/get-quotation", ValidateUser, getQuotation)
leadsrouter.get("/get-quotation-details/:id", ValidateUser, getQuotationDetails)
leadsrouter.put("/edit-quotation/:id", ValidateUser, editQuotation)
leadsrouter.delete("/delete-quotation/:id", ValidateUser, deleteQuotation)

leadsrouter.post("/create-invoice", ValidateUser, createInvoice)
leadsrouter.get("/get-invoice", ValidateUser, getInvoice)
leadsrouter.get("/get-invoice-details/:id", ValidateUser, getInvoiceDetails)
leadsrouter.put("/edit-invoice/:id", ValidateUser, editInvoice)
leadsrouter.delete("/delete-invoice/:id", ValidateUser, deleteInvoice)


leadsrouter.post("/justdial/:id", getJustdialLead)
leadsrouter.post("/indiamart/:id", getIndiamartLead)

//Role
leadsrouter.post("/add-role", ValidateUser, addRole)

// ModuleAccess
leadsrouter.post("/add-module", ValidateUser, addModule)
leadsrouter.get("/get-module", ValidateUser, getModule)
leadsrouter.delete("/delete-module/:id", ValidateUser, deleteModule)
leadsrouter.put("/edit-module/:id", ValidateUser, editModule)
leadsrouter.put("/edit-module-accessibility/:id", ValidateUser, editModuleAccessibility)


// label api's
leadsrouter.post("/add-label",ValidateUser, addLabel)
leadsrouter.get("/get-label",ValidateUser, getLabel)
leadsrouter.delete("/delete-label/:id",ValidateUser, deleteLabel)
leadsrouter.put("/edit-label/:id",ValidateUser, editLabel)


leadsrouter.post("/add-lead-field",ValidateUser, addLeadFields)
leadsrouter.get("/get-lead-field",ValidateUser, getLeadFields)
leadsrouter.delete("/delete-lead-field/:id",ValidateUser, deleteLeadFields)
leadsrouter.put("/edit-lead-field/:id",ValidateUser, editLeadFields)

// Source
leadsrouter.post("/add-source", ValidateUser, addSource)
leadsrouter.get("/get-source", ValidateUser, getSource)
leadsrouter.delete("/delete-source/:id", ValidateUser, deleteSource)
leadsrouter.put("/edit-source/:id", ValidateUser, editSource)
leadsrouter.put("/edit-source-accessibility/:id", ValidateUser, editSourceAccessibility)

module.exports = {leadsrouter};
