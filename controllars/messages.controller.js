const WSMessage = require('../models/messagesModel');

const client = require('twilio')(process.env.SID, process.env.TOKEN);
const MessagingResponse = require('twilio').twiml.MessagingResponse;


const sendMessage = async (req, res) => {
    await client.messages.create({
        body: 'This is testing messgase sended by sandeep Verma',
        from: `whatsapp:${process.env.MY_TEWILIO_NUMBER}`,
        to: 'whatsapp:+919466440136'
    }).then(message => res.send(message));
}
const resiveMessage = async (req, res) => {
    console.log(res.body);
    try {
        let data = new WSMessage({ hookResponse: res.body })
        await data.save()
        res.status(200).json({
            status: true,
            data: data
        })
    } catch (error) {
        res.status(200).json({
            status: false,
            error
        })

    }
}
const resiveMessageStatus = async (req, res) => {
    console.log(res.body);
    try {
        let data = new WSMessage({ hookResponse: res.body })
        await data.save()
        res.status(200).json({
            status: true,
            data: data
        })
    } catch (error) {
        res.status(200).json({
            status: false,
            error
        })
    
    }

}



module.exports = { sendMessage, resiveMessage, resiveMessageStatus }