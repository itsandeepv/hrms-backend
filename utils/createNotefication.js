const moment = require("moment");
const NewNotification = require("../models/notification");

const createNote = async (data) => {
    let createNote = await NewNotification(data)
    let createdata = await createNote.save()
}

const publicUrl = "https://api.cutedgetechnology.com/api"
// const publicUrl = "https://api.crmhai.com/api"
// const publicUrl = "http://localhost:5001/api"

const isToday = (inputDate) => {
  if(inputDate){
    const today = new Date();
    const date = new Date(inputDate);
    // console.log(`${date.getDate()}-${date.getMonth()}-${date.getFullYear()}===${today.getDate()}-${today.getMonth()}-${today.getFullYear()}`);
    return (
      moment(inputDate).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")
      // date.getDate() == today.getDate() &&
      // date.getMonth() === today.getMonth() &&
      // date.getFullYear() === today.getFullYear()
    )
  }else{
    return false
  }
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

const formatDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
  

module.exports = { createNote ,isToday ,isBeforeToday ,publicUrl ,formatDate }