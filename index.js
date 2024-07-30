// require("dotenv").config();
// const express = require("express");
// const app = express();
// const cors = require("cors");
// const mongoose = require("mongoose");
// var bodyParser = require("body-parser");
// const morgen = require("morgan");
// const { authrouter } = require("./routes/authroutes");
// // connection();
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// // middlewares
// app.use(express.json());
// app.use(cors());
// app.use(morgen("dev"));
// app.use(express.urlencoded({ extended: true }));

// const moongose_Url2 = "mongodb+srv://sandeepverma:hrms-database@cluster0.20yfs0b.mongodb.net/";

// //auth route start here
// app.use("/api", authrouter);

// mongoose
//   .connect(moongose_Url2, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then((result) => {
//     // Successfully connected
//     console.log("Your DataBase is Conneted succesfully ");
//   })
//   .catch((err) => {
//     // Catch any potential error
//     console.log(
//       "Unable to connect to MongoDB. Error: Please Check Your EnterNet Connections " +
//         err
//     );
//   });


// const port = 5001;
// app.listen(port, () => {
//   console.log("server connect succesfully on host : " + port);
// });

require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { Server } = require("socket.io");
const { authrouter } = require("./routes/authroutes");
const { leadsrouter } = require("./routes/allroutes");
const { createNote } = require("./utils/createNotefication");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: '*', // Allow only this origin to access the server
  methods: ['GET', 'POST'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type'] // Allow these headers
}));
app.use(morgan("dev"));
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
    let {fullDocument} = changedata
    if(changedata.operationType == "insert"){
      let noteficationDetails = {
        title:"You received  new lead ",
        isRead:false,
        userId :fullDocument.userId || "",
        indiaMartKey :fullDocument.indiaMartKey||"",
        tradeIndaiKey :fullDocument.tradeIndaiKey||"",
        message:fullDocument.queryMessage||""
      }
      createNote(noteficationDetails)
    }
    io.emit("dbUpdate", changedata); // Broadcast change to all connected clients
  });
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server and listen for incoming requests
const port = 5001;
server.listen(port, () => {
  console.log("Server connected successfully on host: " + port);
});
