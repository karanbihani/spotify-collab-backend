const fs = require('fs');

function Read(){
    var n;
    
    const data = fs.readFileSync('Backend/Files/songList.txt', 'utf-8');
    data_array = data.split("\n");
    n = data_array.length;
    data_array.splice(0, n, "");
    const new_data = data_array.join("\n");
    fs.writeFileSync('Backend/Files/songList.txt', new_data, {encoding: "utf-8"});
    console.log(data.split("\n").join(","));
    return(data.split("\n"))
}

function Write(uri){
    fs.appendFile('Backend/Files/songList.txt', `${uri}`+"\n", function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
}

module.exports = {Read, Write, fs}
