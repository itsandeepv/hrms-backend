
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { Server } = require("socket.io");
const cron = require('node-cron');
const { authrouter } = require("./routes/authroutes");
const { leadsrouter } = require("./routes/allroutes");
const { createNote, isToday } = require("./utils/createNotefication");
const NewLeads = require("./models/leadsModel");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});
app.use(cors({
  allowedHeaders: ['Authorization', 'Content-Type'],
  origin: '*',
}));
// app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

const mongooseUrl = process.env.DATABASE_URL || "mongodb+srv://sandeepverma:hrms-database@cluster0.20yfs0b.mongodb.net/hrmsdatabase";

// Auth route start here
app.use("/api", authrouter);
// leads route
app.use("/api", leadsrouter);

// testing socket 


app.get("/test", (req, res) => {
  res.sendFile(__dirname + "/public/sockettest.html")
})

// Connect to MongoDB
mongoose.connect(mongooseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((result) => {
    console.log("Your DataBase is Connected successfully");
  })
  .catch((err) => {
    console.log("Unable to connect to MongoDB. Error: " + err);
  });

// Listen for MongoDB changes using Change Streams
const db = mongoose.connection;
db.once("open", () => {
  console.log("MongoDB database connection established successfully");
  const collection = db.collection("leads");
  const changeStream = collection.watch();
  // console.log(collection);
  changeStream.on("change", (changedata) => {
    // console.log("Change detected:", changedata);
    let { fullDocument } = changedata
    if (changedata.operationType == "insert") {
      let noteficationDetails = {
        title: "You received  new lead ",
        isRead: false,
        userId: fullDocument.userId || "",
        indiaMartKey: fullDocument.indiaMartKey || "",
        tradeIndaiKey: fullDocument.tradeIndaiKey || "",
        message: fullDocument.queryMessage || "",
        leadId: fullDocument._id || "",
        leadSource: fullDocument.leadSource || "",
      }
       // createNote(noteficationDetails)
      
      io.emit("dbUpdate", changedata); // Broadcast change to all connected clients
    }
  });
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("A user connected",socket.id);
  socket.on("userDetails", async (data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the start of the day
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Set to the start of the next day
    try {
      // Fetch leads based on user details and follow-up date
      const leads = await NewLeads.find({
        $or: [
          { indiaMartKey: data.indiaMartKey },
          { userId: data._id }
        ]
      });
      const filteredLeads = leads.filter(lead => isToday(lead.nextFollowUpDate));
      console.log(filteredLeads);
      
      // Emit notifications for the filtered leads
      filteredLeads.forEach(lead => {
        socket.emit('followUpNotification', {
          message: 'This is a reminder for your follow-up scheduled for today with ' + lead.senderName,
          lead
        });
      });
    } catch (err) {
      console.error('Error fetching leads: ', err);
    }
  });
  
  io.emit('triggerUserDetails');

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server and listen for incoming requests
const port = process.env.PORT || 5001;
server.listen(port, () => {
  console.log("Server connected successfully on host: " + port);
});
