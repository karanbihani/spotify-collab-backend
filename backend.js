const express = require("express");
const app = express();
const port = 3000;

const dotenv = require("dotenv");
dotenv.config({ path: '.env' });

const querystring = require('querystring');
const pg = require('pg');

const CLIENT_ID  = process.env.CLIENT_ID;
const CLIENT_SECRET  = process.env.CLIENT_SECRET;
const PLAYLIST_ID = process.env.PLAYLIST_ID;
const redirect_uri = process.env.REDIRECT_URI;
const ReadWrite = require("./utils/ReadWrite");
const { checkPrime } = require("crypto");

console.log(CLIENT_ID, CLIENT_SECRET, PLAYLIST_ID, CONSTRING);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const client = new pg.Client(CONSTRING);

var access_token;
var refresh_token;
var expires_in;

var delay = 5;



async function connectCLient(){
  try{
    await client.connect();
    console.log("connected")
  }
  catch(err){
    console.log("Could not connect:", err)
  }

}

// Routes:
app.get("/", (req, res)=>{
  res.send("Hi")
});

app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  var scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative';

  console.log("login")

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: `${CLIENT_ID}`,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});



app.get('/callback', async function (req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  
  if (state === null) {
    res.redirect('/#' +
        querystring.stringify({
            error: 'state_mismatch'
        }));
    } else {
      await connectCLient();
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'content-type': ' ',
            'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            access_token = body.access_token;
            refresh_token = body.refresh_token;
            expires_in = body.expires_in;
            
            res.send('Authentication successful! Access token: ' + access_token +"<br>"+ expires_in +"<br>"+refresh_token);
            console.log("Access Token:\n", access_token)
            startAddingSpotifySongs(access_token);
            accessTokenRefresher();
        } else {
            res.status(response.statusCode).send('Error: ' + error);
        }
    });

}
});

// Adding songs to playlist

app.post("/add", (req, res)=>{
  console.log(req.body)
  var {url, user_access_token} = req.body;
  var uri = convertToSpotifyURI(url);
  
  // checkInfo : 
  // 0 if correct
  // 1 if duplicate uri
  // 2 if user rate limited

  temp = ReadWrite.checkInfo(client, uri, user_access_token);
  if( temp === 1){
    console.log("already exits")
  }
  else if(temp === 2){
    console.log("Slow down send request after some time (not been 5 mins since last request)")
  }
  else{
    res.send("WORKED");
    ReadWrite.Write(client, `${uri}`, user_access_token);
  }
})



app.listen(port, ()=>{
    console.log(`Example app listening on port: ${port}`)
})
