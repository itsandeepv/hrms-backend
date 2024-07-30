const NewNotification = require("../models/notification");

const createNote = async (data) => {
    let createNote = await NewNotification(data)
    let createdata = await createNote.save()
    // console.log(createdata);
}


module.exports = { createNote }