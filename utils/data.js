const DELAY = 240;

async function Read(client) {
    try {
        const result = await client.query('SELECT uri FROM song_log WHERE added = FALSE');
        const songs_to_add = result.rows.map(row => row.uri);

        const updateQuery = 'UPDATE song_log SET added = TRUE WHERE uri = ANY($1)';
        await client.query(updateQuery, [songs_to_add]);

        console.log('Updated the added column for retrieved records');
        console.log('URIs:', songs_to_add);
        console.log('Joined URIs:', songs_to_add.join(","));
        
        return songs_to_add;
    } catch (err) {
        console.error('Error:', err);
        return [];
    }
}
    // For Text file

    // var n;
    
    // const data = fs.readFileSync('Backend/Files/songList.txt', 'utf-8');
    // data_array = data.split("\n");
    // n = data_array.length;
    // data_array.splice(0, n, "");
    // const new_data = data_array.join("\n");
    // fs.writeFileSync('Backend/Files/songList.txt', new_data, {encoding: "utf-8"});
    // console.log(data.split("\n").join(","));
    // return(data.split("\n"))

async function Write(client, uri, access_token) {
    try {
        const query = `INSERT INTO song_log (uri, access_token, log_time) VALUES ($1, $2, CURRENT_TIMESTAMP)`;
        await client.query(query, [uri, access_token]);
        console.log('Inserted a record');
    } catch (err) {
        console.error('Error running query:', err);
    }
}   

    // fs.appendFile('Backend/Files/songList.txt', `${uri}`+"\n", function (err) {
    //     if (err) throw err;
    //     console.log('Saved!');
    //   });

async function checkInfo(client, uri, access_token){
    try{
        const result = await client.query('SELECT uri FROM song_log');
        const songs_added = result.rows.map(row => row.uri);

        if (songs_added.includes(uri)){
            return 1;
        }

        const result1 = await client.query(`SELECT log_time FROM song_log WHERE access_token = '${access_token}' ORDER BY log_time DESC LIMIT 1` );
        
        if (result1.rows.length === 0) {
            return 0;
        }

        const lastRequestTime = new Date(result1.rows[0].log_time);
        
        console.log(lastRequestTime);

        const currentTime = new Date();
        // const utcDate = new Date(Date.UTC());

        const londonTime = currentTime.toLocaleString("en-GB", {timeZone: "Europe/London"});

        console.log(londonTime);

        // const timeDifferenceMinutes = (currentTime - lastRequestTime) / (1000 * 60);

        const timeDifferenceMinutes = Math.floor((currentTime.getTime() - lastRequestTime.getTime()) / (1000 * 60));

        console.log(timeDifferenceMinutes);

        if(timeDifferenceMinutes > (330+DELAY)){
            return 0;
        }
        
        return(2)
    }
    
    catch(err){
        console.error("Error:", err);
        throw err; 
    }
}

module.exports = {Read, Write, checkInfo}
