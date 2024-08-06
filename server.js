require('./config/db');
const express = require('express');
const cors = require('cors');
const router = require("./router/router");


const port = process.env.PORT || 2500;

const app = express();

app.use(cors({
    origin: "*"
}));
app.use(express.json());

app.use('/api/v1', router);

app.listen(port, () => {
    console.log(`Server is running on PORT: ${port}`);
});