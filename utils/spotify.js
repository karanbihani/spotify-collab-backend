const request = require('request'); 

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

const getRefreshToken =  (rfToken)=>{
    var refreshTokenRequest = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        grant_type: 'refresh_token',
        refresh_token: rfToken,
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
        console.log("Timer Reached 0");
  
        console.log("Sending post request");
  
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


  const startAddingSpotifySongs = (access_token)=>{  
    addSpotifySongs =  setInterval(async ()=>{
    songList = await ReadWrite.Read(client);
  
    console.log(songList)
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
  
      console.log(authOptions.headers, authOptions.body.uris)
      console.log(songList)
  
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


  module.exports = {
    generateRandomString,
    convertToSpotifyURI,
    getRefreshToken,
    accessTokenRefresher,
    startAddingSpotifySongs
  }