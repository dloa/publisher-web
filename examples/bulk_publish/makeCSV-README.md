#Welcome!

This little miniapp is used to simply create a csv file from a folder of videos.

## How to use
First install with: `npm install`
Then edit the file to change the global variables (i.e. Artist, etc)
If you have not yet created a folder named `playlist_videos` please do that now.
Download your Youtube playlist/videos using: 
```
youtube-dl --write-description --write-thumbnail --o './playlist_videos/%(id)s.%(title)s.%(ext)s' -f 137+140 https://www.youtube.com/watch?list=PL3EED4C1D684D3ADF
```
Run the script using `node makeCSV.js`
It should output a file named `output.csv`.
Drag the `output.csv` file onto the CSV file select in the Bulk Publisher (on the Tools page)
Drag all the files in `playlist_videos` into the Bulk Publisher File Dropzone

Select "Bulk Publish"