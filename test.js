var pg = require('pg');

var conString = "postgres://rjhdzqvb:mCwkUpnxVnsrEDVE0_bUsYl0CRqNo03p@rain.db.elephantsql.com/rjhdzqvb";
const client = new pg.Client(conString)

async function connectCLient(){
    try{
      await client.connect();
      console.log("connected")
    }
    catch(err){
      console.log("Could not connect:", err)
    }
  
  }

async function ha(){
  console.log("goog")
  await connectCLient()
  console.log("booog")
  console.log("booog")
  }
  
ha()