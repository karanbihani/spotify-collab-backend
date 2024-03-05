// db.js

const pg = require('pg');

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

// Export the getClient function
module.exports = {
    getClient: getClient
};
