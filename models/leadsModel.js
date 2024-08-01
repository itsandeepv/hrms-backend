const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const LeadsSchema = new mongoose.Schema({
    uniqeQueryId:{type:String},
    userId:{type:String},
    rfiId:{type:String},
    indiaMartKey:{type:String},
    tradeIndaiKey:{type:String},
    leadCallDuration:{type:String},
    queryMcatName:{type:String},
    queryMessage:{type:String},//message == queryMessage we can consider this as requirement of clients
    queryProductName:{type:String},//product_name == queryProductName
    queryTime:{type:String},//generated_time == queryTime
    queryTimeStaps:{type:Number},//generated == queryTimeStaps
    monthSlot:{type:String},//tradeindia
    queryType:{type:String},//Eg. B,P
    productSource:{type:String},//may be productSource == queryType
    querySource:{type:String},// source == querySource whatsapp , phone etc.
    receiverMobile:{type:Number},
    receiverUid:{type:String},
    receiverName:{type:String},
    receiverCompany:{type:String},
    senderName:{type:String},
    senderUid:{type:String},
    senderEmail:{type:String},
    senderEmailAlt:{type:String},
    senderMobileNumber:{type:Number},
    senderMobileNumberAlt:{type:Number},//sender_other_mobiles == senderMobileNumberAlt
    senderCity:{type:String},
    senderCountry:{type:String},
    senderAddress:{type:String},
    senderCompany:{type:String},//sender_co == senderCompany
    senderCompanyIso:{type:String},
    senderPhone:{type:String},
    senderPhoneAlt:{type:String},
    senderPinCode:{type:Number},
    subject:{type:String},//subject ==subject
    inquiryType:{type:String,default:"Buyer"},
    sender:{type:String,default:"Client"},
    viewStatus:{type:String},
    isLeadComplete:{type:Boolean},
    nextFollowUpDate:{type:String},
    productId:{type:String},
    leadSource:{type:String},
    statusBar:{type:Array,},
    followupDates:[],
    isPositiveLead:{type:Boolean ,default:true},
    leadStatus:[],
    leadsUpdates:{type:Schema.Types.ObjectId ,ref:"LeadsUpdates"}

}, { timestamps: true })


const NewLeads = mongoose.model("Leads", LeadsSchema)
module.exports = NewLeads