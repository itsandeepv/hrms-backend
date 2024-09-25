const { autoLeadAssign } = require("../helpers/autoLeadAssign");
const { publicUrl } = require("./createNotefication");
const { leadRecivedEmail } = require("./sendEmail");


let isMessSave = true

const sendNotification = (fullDocument, io, changedata) => {
  autoLeadAssign(fullDocument)
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
  leadRecivedEmail(fullDocument )
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(notificationDetails)
  };
  if (isMessSave) {
    fetch(`${publicUrl}/new-notification`, requestOptions).then((res) => res.json()).then((data) => {
      // console.log(data, notificationDetails);
      isMessSave = false
    }).catch((er) => {
      console.log(er);
    })
  }
  //  createNote(noteficationDetails)

  io.emit("dbUpdate", changedata);
}



module.exports = { sendNotification }