const mongoose = require("mongoose")

const LeadsUpdatesSchema = new mongoose.Schema({
    uniqeQueryId:{type:String},
    userId:{type:String},
    indiaMartKey:{type:String},
    tradeIndaiKey:{type:String},
    leadCallDuration:{type:String},
    queryMcatName:{type:String},
    queryMessage:{type:String},//message == queryMessage
    queryProductName:{type:String},//product_name == queryProductName
    queryTime:{type:String},//generated_time == queryTime
    queryTimeStaps:{type:Number},//generated == queryTimeStaps
    monthSlot:{type:String},//tradeindia
    queryType:{type:String},//Eg. B,P
    productSource:{type:String},//may be productSource == queryType
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
    viewStatus:{type:String},
    productId:{type:String},
    leadStatus:{
        type:Array
    }

}, { timestamps: true })


const LeadsUpdates = mongoose.model("LeadUpdates", LeadsUpdatesSchema)
module.exports = LeadsUpdates