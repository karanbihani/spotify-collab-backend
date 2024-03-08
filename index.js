const express = require("express");
const app = express();
const cors = require('cors')
const db = require('./db/db')

const dotenv = require("dotenv");
dotenv.config({ path: '.env' });

const corsOptions = {
    origin: '*',
    credentials: true, // access-control-allow-credentials:true
    optionSuccessStatus: 200
}
  
const client = db.getClient();
db.connectClient(client);

// Now you can use the client to interact with your PostgreSQL database

app.use(cors(corsOptions))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

module.exports = app