
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const { authrouter } = require("./routes/authroutes");
const { leadsrouter } = require("./routes/allroutes");
const { isToday, publicUrl } = require("./utils/createNotefication");
const NewLeads = require("./models/leadsModel");
const { MongoClient } = require('mongodb');
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

const mongooseUrl = process.env.DATABASE_URL || "mongodb://hrmsDBs:98sdis90d@167.71.236.39:27017/hrms?authSource=admin"
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
})
  .then((result) => {
    console.log("Your DataBase is Connected successfully");
  })
  .catch((err) => {
    console.log("Unable to connect to MongoDB. Error: " + err);
  });

  
  let isMessSave = true
  // Listen for MongoDB changes using Change Streams
  const db = mongoose.connection;

  // db.command({
  //   grantRolesToUser: "sandeep",
  //   roles: [{ role: "read", db: "crm" }, { role: "changeStream", db: "crm" }]
  // })

  // async function main() {
  //   const uri = "mongodb://hrmsDBs:98sdis90d@167.71.236.39:27017/hrms?authSource=admin";
    
  //   const client = new MongoClient(uri,{ useNewUrlParser: true, useUnifiedTopology: true });
  
  //   try {
  //     await client.connect();
      
  //     const db = client.db("hrms");
  
  //     // Run the command
  //     // const result = await db.command({
  //     //   grantRolesToUser: "hrmsDBs",
  //     //   roles: [{ role: "read", db: "hrms" }, { role: "changeStream", db: "hrms" }]
  //     // });
      
  //     console.log("Command executed:", result);
  
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     await client.close();
  //   }
  // }
  
  // main().catch(console.error);



db.once("open", () => {
  console.log("MongoDB database connection established successfully");
  const collection = db.collection("leads");
  const changeStream = collection.watch();
  // console.log(collection);
  changeStream.on("change", (changedata) => {
    // console.log("Change detected:", changedata);
    let { fullDocument } = changedata
    if (changedata.operationType == "insert") {
      sendNotification(fullDocument ,io ,changedata)
      // let notificationDetails = {
      //   title: "You received  new lead ",
      //   isRead: false,
      //   userId: fullDocument.userId || "",
      //   indiaMartKey: fullDocument.indiaMartKey || "",
      //   tradeIndaiKey: fullDocument.tradeIndaiKey || "",
      //   message: fullDocument.queryMessage || "",
      //   leadId: fullDocument._id || "",
      //   leadSource: fullDocument.leadSource || "",
      // }
      // const requestOptions = {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify(notificationDetails)
      // };
      // if (isMessSave) {
      //   fetch(`${publicUrl}/new-notification`, requestOptions).then((res) => res.json()).then((data) => {
      //     // console.log(data, notificationDetails);
      //     isMessSave = false
      //   }).catch((er) => {
      //     console.log(er);
      //   })
      // }
      // io.emit("dbUpdate", changedata); // Broadcast change to all connected clients
    }
  });
});


// WebSocket connection
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
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
      // console.log(filteredLeads);
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



module.exports = { server }