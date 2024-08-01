const NewNotification = require("../models/notification");

const createNote = async (data) => {
    let createNote = await NewNotification(data)
    let createdata = await createNote.save()
    // console.log(createdata);
}

const isToday = (date) => {
    const today = new Date();
    date = new Date(date);
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

module.exports = { createNote ,isToday }