const express = require("express");
const bodyParser = require("body-parser")
const multer = require("multer");
const route = require("./routes/route.js");

const app = express()
//app.use(express.json())

app.use(multer().any())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", route)

//port is two-way communication link between two programs running on the network
app.listen(process.env.PORT || 3000, function() {
    console.log("Express app running on port " + (process.env.PORT || 3000));
});
