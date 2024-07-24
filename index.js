require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
var bodyParser = require("body-parser");
const morgen = require("morgan");
const { authrouter } = require("./routes/authroutes");
// connection();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// middlewares
app.use(express.json());
app.use(cors());
app.use(morgen("dev"));
app.use(express.urlencoded({ extended: true }));

const moongose_Url2 = "mongodb+srv://sandeepverma:hrms-database@cluster0.20yfs0b.mongodb.net/";

//auth route start here
app.use("/api", authrouter);

mongoose
  .connect(moongose_Url2, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    // Successfully connected
    console.log("Your DataBase is Conneted succesfully ");
  })
  .catch((err) => {
    // Catch any potential error
    console.log(
      "Unable to connect to MongoDB. Error: Please Check Your EnterNet Connections " +
        err
    );
  });



  // Define the structure for the received data.
class ReceivedData {
  constructor(data) {
    this.code = data.CODE;
    this.status = data.STATUS;
    this.response = data.RESPONSE;
  }
}

// Define the structure for the response to be sent back.
class Response {
  constructor(code, status ,res) {
    this.code = code;
    this.status = status;
    this.response = res;
  }

  toJSON() {
    return { code: this.code, status: this.status,response :this.response };
  }
}

// Function to handle the webhook requests.
function webhookHandler(req, res) {
  const data = req.body;

  if (!data) {
    res.status(400).json({ error: 'Invalid JSON data' });
    return;
  }

  // Parse the JSON data.
  const receivedData = new ReceivedData(data);

  // Log the received data for debugging purposes.
  console.log("Received data:", receivedData);

  // Determine the response based on the received data.
  let response;
  switch (receivedData.code) {
    case 200:
      response = new Response(200, "Success");
      break;
    case 400:
      response = new Response(400, "Missing parameters");
      break;
    case 500:
      response = new Response(500, "Error in connecting to the URL");
      break;
    default:
      response = new Response(500, "Unknown error");
      break;
  }

  // Set the response header and write the JSON response.
  res.status(response.code).json(response);
}

// Start the server and listen for incoming requests.
app.post('/indiamart/6dE9K5uZguEf6n5Pj2JNjErINrlrr95_', webhookHandler);







const port = 5001;
app.listen(port, () => {
  console.log("server connect succesfully on host : " + port);
});
