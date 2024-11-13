const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const LeadsSchema = new mongoose.Schema({
    uniqeQueryId:{type:String},
    userId:{type:String},
    companyId:{type:String},
    rfiId:{type:String},
    indiaMartKey:{type:String},
    tradeIndaiKey:{type:String},
    leadAddedBy:{type:String,trim:true},
    leadAssignTo:{type:String, default: ""},
    leadAssignAt:{
        type:String,
        trim:true,
        default:moment(new Date).format('YYYY-MM-DD HH:mm:ss')
    },
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
    senderMobileNumber:{type:String ,unique: true},
    senderMobileNumberAlt:{type:String},//sender_other_mobiles == senderMobileNumberAlt
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
    nextFollowUpTime:{type:String},
    productId:{type:String},
    labelValue:{type:String},
    leadSource:{type:String},
    statusBar:{type:Array,},
    followupDates:[],
    isPositiveLead:{type:String ,default:"new"},
    createdAt:{type:Date ,default:Date.now()},
    leadStatus:[],
    dealStatus:{type:String},
    leadsUpdates:{type:Schema.Types.ObjectId ,ref:"LeadsUpdates"},
    quotationIds: {
        type: Array,
        default: []
    },
    invoiceIds: {
        type: Array,
        default: []
    }

}, { timestamps: true })


const NewLeads = mongoose.model("Leads", LeadsSchema)
module.exports = NewLeads