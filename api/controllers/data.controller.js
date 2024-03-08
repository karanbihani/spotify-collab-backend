require('dotenv').config()

const data = require(join(__dirname, '..', '..', '..', 'utils', 'data'))
const spotify = require(join(__dirname, '..', '..', '..', 'utils', 'spotify'))

exports.callback = async function (req, res, client) {
    var code = req.query.code || null;
    var state = req.query.state || null;
    
    if (state === null) {
      res.redirect('/#' +
          querystring.stringify({
              error: 'state_mismatch'
          }));
      } else {
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
              var access_token = body.access_token;
              var refresh_token = body.refresh_token;
              var expires_in = body.expires_in;
              
              res.send('Authentication successful! Access token: ' + access_token +"<br>"+ expires_in +"<br>"+refresh_token);
              console.log("Access Token:\n", access_token)
              spotify.startAddingSpotifySongs(access_token, expires_in, client);
              spotify.accessTokenRefresher(refresh_token, expires_in);
          } else {
              res.status(response.statusCode).send('Error: ' + error);
          }
      });
  
  }
}

exports.add = (req, res, client)=>{
    var {url, user_access_token} = req.body;
    var uri = spotify.convertToSpotifyURI(url);
    
    // checkInfo : 
    // 0 if correct
    // 1 if duplicate uri
    // 2 if user rate limited
  
    temp = data.checkInfo(client, uri, user_access_token);
    if( temp === 1){
      console.log("already exits")
      return 1;
    }
    else if(temp === 2){
      console.log("Slow down send request after some time (not been 5 mins since last request)")
      return 2;
    }
    else{
      res.send("WORKED");
      ReadWrite.Write(client, `${uri}`, user_access_token);
      console.log("Worked Song added")
      return 0;
    }
}   
