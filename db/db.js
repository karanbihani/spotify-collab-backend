// db.js

const pg = require('pg');
const dotenv = require("dotenv");
dotenv.config({ path: '.env' });

// Your PostgreSQL connection string
const CONSTRING = process.env.CONSTRING;

// Initialize the client as null initially
let client = null;

// Wrapper function to lazily initialize pg.Client
function getClient() {
    // If client is not initialized, create a new client
    if (!client) {
        client = new pg.Client(CONSTRING);
    }
    return client;
}

connectClient = async(client)=>{
    console.log("Started connecting")
    client.connect((err) => {
    if (err) {
        console.error('Error connecting to PostgreSQL database:', err);
    } else {
        console.log('Connected to PostgreSQL database successfully');
    }
    });
}


// Export the getClient function
module.exports = {
    getClient: getClient,
    connectClient: connectClient
};
