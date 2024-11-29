require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const { authrouter } = require("./routes/authroutes");
const { leadsrouter } = require("./routes/allroutes");
const { isToday } = require("./utils/createNotefication");
const NewLeads = require("./models/leadsModel");
const { sendNotification } = require("./utils/sendNotification");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
mongoose.set('autoIndex', false);
// mongoose.set('bufferCommands', false)
mongoose.set('strictQuery', false);
app.set('io', io); // Store io instance in the app context

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
app.use("/uploads", express.static("uploads"));

const mongooseUrl = process.env.DATABASE_URL || "mongodb+srv://crmhaicom:jpJ1TNDIXOXRTMym@cluster0.1zzq2.mongodb.net/crm"
// "mongodb://hrmsDBs:98sdis90d@167.71.236.39:27017/hrms?authSource=admin"
// "mongodb+srv://crmhaicom:jpJ1TNDIXOXRTMym@cluster0.1zzq2.mongodb.net/crm"

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
  // serverSelectionTimeoutMS: 30000,
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
      sendNotification(fullDocument, io, changedata)
    }
  });
});


// WebSocket connection

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  socket.on("userDetails", async (data) => {
    try {
      // Fetch leads based on user details and follow-up date
      const leads = data?.role === "admin" ? await NewLeads.find({
        $or: [
          { companyId: data?._id },
          { userId: data?._id }
        ]
      }) : await NewLeads.find({leadAssignTo: data?._id})
      const filteredLeads = data?.role === "admin" ? leads.filter(lead => isToday(lead.nextFollowUpDate) && (lead?.leadAssignTo===undefined || lead?.leadAssignTo==="")) : leads.filter(lead => isToday(lead.nextFollowUpDate))
      // Emit notifications for the filtered leads
      const newData = filteredLeads.map(lead => {return {
        message: 'This is a reminder for your follow-up scheduled for today with ' + lead.senderName,
        lead
      }});
      socket.emit('followUpNotification', newData);
    } catch (err) {
      console.error('Error fetching leads: ', err);
    }
  });

  io.emit('triggerUserDetails');
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// io.on("connection", (socket) => {
//   console.log("A user connected", socket.id);
//   socket.on("userDetails", async (data) => {
//     try {
//       // Fetch leads based on user details and follow-up date
//       const leads = data?.role === "admin" ? await NewLeads.find({userId: data?._id}) : await NewLeads.find({leadAssignTo: data?._id})
//       const filteredLeads = data?.role === "admin" ? leads.filter(lead => isToday(lead.nextFollowUpDate) && (lead?.leadAssignTo===undefined || lead?.leadAssignTo==="")) : leads.filter(lead => isToday(lead.nextFollowUpDate))
     
//       // Emit notifications for the filtered leads
//       const newData = filteredLeads.map(lead => {return {
//         message: 'This is a reminder for your follow-up scheduled for today with ' + lead.senderName,
//         lead
//       }});
//       socket.emit('followUpNotification', newData);
//     } catch (err) {
//       console.error('Error fetching leads: ', err);
//     }
//   });

//   io.emit('triggerUserDetails');
//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });

// Start the server and listen for incoming requests
const port = process.env.PORT || 5001;
server.listen(port, () => {
  console.log("Server connected successfully on host: " + port);
});

