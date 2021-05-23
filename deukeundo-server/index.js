
const express = require('express');
const bodyParser = require('body-parser');
const InitiateMongoServer = require("./config/db");
const user = require("./routes/user");


InitiateMongoServer();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({ message: "Hello"})
});

app.use("/user", user)

app.listen(PORT, (req, res) => {
    console.log(`Server running at  PORT ${PORT}`);
});