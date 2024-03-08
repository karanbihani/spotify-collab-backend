const express = require("express");
const app = express();
const port = 3000;

const dotenv = require("dotenv");
dotenv.config({ path: '.env' });

const querystring = require('querystring');
const request = require('request'); 
const pg = require('pg');
const cors = require("cors");

const CONSTRING = process.env.CONSTRING;
const CLIENT_ID  = process.env.CLIENT_ID;
const CLIENT_SECRET  = process.env.CLIENT_SECRET;
const PLAYLIST_ID = process.env.PLAYLIST_ID;
const redirect_uri = 'http://localhost:3000/callback';

const ReadWrite = require("./utils/data");

console.log(CLIENT_ID, CLIENT_SECRET, PLAYLIST_ID, CONSTRING);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const client = new pg.Client(CONSTRING);

var access_token;
var refresh_token;
var expires_in;

var delay = 5;

// Utility:
function generateRandomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

function convertToSpotifyURI(url) {
  const trackID = url.split('/').pop().split('?')[0];
  return `spotify:track:${trackID}`;
};

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

const getRefreshToken =  () => {
  var refreshTokenRequest = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    },
    headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
    },
    json: true
  };
  return(refreshTokenRequest)
};

const accessTokenRefresher = ()=>{
  a = setInterval(()=>{
    expires_in -= 1;
    // console.log(expires_in);

    if (expires_in<=0){
      // console.log("Timer Reached 0");

      // console.log("Sending post request");

      request.post(getRefreshToken(), function(error, response, body) {
        if (!error && response.statusCode === 200) {
          access_token = body.access_token
          expires_in = body.expires_in
          if(body.refresh_token){
            refresh_token = body.refresh_token;
          }
          console.log(access_token, refresh_token);
        }
      });
    }

  }, 1000)
};

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

app.post("/add", async (req, res)=>{
  console.log(req.body)
  var {url, email} = req.body;
  console.log(email);
  var uri = convertToSpotifyURI(url);
  
  // checkInfo : 
  // 0 if correct
  // 1 if duplicate uri
  // 2 if user rate limited

  var temp = await ReadWrite.checkInfo(client, uri, email);

  console.log(temp)

  if( temp === 1){
    console.log("already exits")
  }
  else if(temp === 2){
    console.log("Slow down send request after some time (not been 5 mins since last request)")
  }
  else{ 
    res.send("WORKED");
    ReadWrite.Write(client, `${uri}`, email);
  }
})

const startAddingSpotifySongs = (access_token)=>{  
  addSpotifySongs =  setInterval(async ()=>{
  songList = await ReadWrite.Read(client);

  // console.log(songList)
  // if (songList.length === 0) {
  //   console.log("is 0\n",songList, songList.length);
  // }
  if(1===0){}
  else{
    var authOptions = {
      url: `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`,
      body: {
          uris: songList
      },
      headers: {
          Authorization: 'Bearer ' + access_token
      },
      json: true
    };

    // console.log(authOptions.headers, authOptions.body.uris)
    // console.log(songList)

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
          var snapshot_id = body.snapshot_id; 
          
          console.log("Added!!\n", snapshot_id)
      } else {
        console.error('Error: ' + error);
      }
    });    
  }
  }, 1000*delay)
}

app.listen(port, ()=>{
    console.log(`Example app listening on port: ${port}`)
})
