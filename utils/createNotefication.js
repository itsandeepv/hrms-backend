const NewNotification = require("../models/notification");

const createNote = async (data) => {
    let createNote = await NewNotification(data)
    let createdata = await createNote.save()
    // console.log(createdata);
}
// const publicUrl = "https://api.crmhai.com/api"
const publicUrl = "http://localhost:5001/api"


const isToday = (date) => {
  const today = new Date();
  date = new Date(date);
  // console.log(date.getDate() , today.getDate());
  return date.getDate()+1 == today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};


const isBeforeToday = (dateString) => {
  // Get today's date in UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Parse the input date string or object in UTC
  const date = new Date(dateString);
  date.setUTCHours(0, 0, 0, 0);

  // Compare the dates
  return date < today;
};

  

module.exports = { createNote ,isToday ,isBeforeToday ,publicUrl }