//var youtube = require("youtube-api");
//var youtubedl = require('youtube-dl');

var fs = require('fs');
var Papa = require('papaparse');

var videoItems = [];

var author = "CrashCourse";
var year = 2017;

var jsonData = {fields: [ 'ID', 'Type', 'Title', 'Description', 'Artist', 'Year', 'Files' ], data: [] };
var finalArrayRow = [ '', '', '', '', '', '', '' ];
var finalArrayCount = 0;

fs.readdir(__dirname + '/playlist_videos', function(err, items) {
    for (var i=0; i<items.length; i++) {
        var splitItems = items[i].split(".");

        if (splitItems.length > 0 && splitItems.length === 3 && splitItems[2] === "description"){
        	var id = splitItems[0];
        	var title = splitItems[1];

        	var data = fs.readFileSync(__dirname + '/playlist_videos/' + items[i], {encoding: 'utf-8'})
			var description = data;

			var videoJSON = {
				fname: title + ".mp4",
				dname: title,
				type: "Video",
				subtype: "Basic"
			}

			var thumbJSON = {
				fname: title + ".jpg",
				dname: title + " Thumbnail",
				type: "Image",
				subtype: "Thumbnail"
			}

			var filesText = JSON.stringify(videoJSON) + ";" + JSON.stringify(thumbJSON);

			jsonData.data.push([id, "Video-Basic", title, description, author, year, filesText]);

			finalArrayCount += 1;
        }
    }

    for (var i = 0; i < finalArrayCount; i++) {
    	//jsonData.data.push(finalArrayRow);
    }

    //console.log(jsonData.data);
    var csvData = Papa.unparse(jsonData);
    fs.writeFile(__dirname + '/output.csv', csvData, 'utf8', function(){ console.log("Write output.csv"); });
});

			

// ytdl.exec(url, ['-x', '--audio-format', 'mp3'], {}, function(err, output) {
//   if (err) throw err;
//   console.log(output.join('\n'));
// });