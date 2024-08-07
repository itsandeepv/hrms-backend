const NewNotification = require("../models/notification");

const createNote = async (data) => {
    let createNote = await NewNotification(data)
    let createdata = await createNote.save()
    // console.log(createdata);
}
const publicUrl = "http://hrmss.gocoolcare.com/api"
// const publicUrl = "http://localhost:5001/api"

const isToday = (date) => {
    const today = new Date();
    date = new Date(date);
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isBeforeToday = (dateString) => {
    const today = new Date();
    // Remove the time part of today's date for an accurate comparison
    today.setHours(0, 0, 0, 0);
    // Create a Date object from the given date string
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
  
    return date < today;
  };
  

module.exports = { createNote ,isToday ,isBeforeToday ,publicUrl }