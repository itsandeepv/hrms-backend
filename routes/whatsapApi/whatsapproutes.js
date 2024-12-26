const { sendMessage, resiveMessage, resiveMessageStatus } = require("../../controllars/messages.controller");

const messageRoutes = require("express").Router()

messageRoutes.post("/sendMessage" ,sendMessage)
messageRoutes.post("/resiveMessage" ,resiveMessage)
messageRoutes.post("/resiveMessageStatus" ,resiveMessageStatus)



module.exports = {messageRoutes};