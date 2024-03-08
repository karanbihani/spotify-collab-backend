const request = require('request'); 
const data = require('./data')

// Utility:

exports.generateRandomString = (length) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

exports.convertToSpotifyURI = (url) => {
  const trackID = url.split('/').pop().split('?')[0];
  return `spotify:track:${trackID}`;
};

getRefreshToken =  (rfToken)=>{
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
  
exports.accessTokenRefresher = (rfToken, expires_in)=>{
  a = setInterval(()=>{
    expires_in -= 1;

    if (expires_in<=0){
      console.log("Timer Reached 0");

      console.log("Sending post request");

      request.post(getRefreshToken(), function(error, response, body) {
        if (!error && response.statusCode === 200) {
          access_token = body.access_token
          expires_in = body.expires_in
          if(body.refresh_token){
            rfToken = body.refresh_token;
          }
          console.log(access_token, refresh_token);
          return {"access_token": access_token, rfToken:rfToken }
        }
      });
    }
  }, 1000)
};

exports.startAddingSpotifySongs = (access_token, expires_in, client)=>{  
  addSpotifySongs =  setInterval(async (expire = expires_in)=>{
  songList = await data.Read(client);

  expire -= delay;

  console.log(songList)
  // if (songList.length === 0) {
  //   console.log("is 0\n",songList, songList.length);
  // }
  if(expire<=0){
    clearInterval(addSpotifySongs)
  }
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