const { autoLeadAssign } = require("../helpers/autoLeadAssign");
const { publicUrl } = require("./createNotefication");
const { leadRecivedEmail } = require("./sendEmail");



const sendNotification = (fullDocument, io, changedata) => {
  // console.log("fullDocument" ,fullDocument);
  
  let notificationDetails = {
    title: "You received  new lead ",
    isRead: false,
    userId: fullDocument.userId || "",
    indiaMartKey: fullDocument.indiaMartKey || "",
    tradeIndaiKey: fullDocument.tradeIndaiKey || "",
    message: fullDocument.queryMessage || "",
    leadId: fullDocument._id || "",
    leadSource: fullDocument.leadSource || "",
  }
  if(fullDocument.leadSource != "direct"){
    autoLeadAssign(fullDocument, io)
    leadRecivedEmail(fullDocument)
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(notificationDetails)
    };
    
      fetch(`${publicUrl}/new-notification`, requestOptions).then((res) => res.json()).then((data) => {
        // console.log(data, notificationDetails);
      }).catch((er) => {
        console.log(er);
      })
    
    io.to(fullDocument.userId).emit("dbUpdate", changedata);
  }

}



module.exports = { sendNotification }