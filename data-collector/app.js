const request = require('request');
const JSONStream = require('JSONStream');
const es = require('event-stream');
const http = require('http');
const fs = require('fs');

const timeDelay = 5000; // milliseconds to wait before starting business logic

// Wait a bit for darknet to come up first
console.log(`Waiting to start data-collector`)
setTimeout(() => {
  console.log(`Data-collector controller starting`);
  beginProcessingRecords();
}, timeDelay);

function beginProcessingRecords() {
  request({url: 'http://localhost:9070'})
    .pipe(JSONStream.parse('*'))
    .pipe(es.mapSync(function (data) {
      processFrame(data)
      return data
    }));
}

/*
  For each frame with a prediction, save that frame for analysis later
*/
function processFrame(frame) {
  // Print the frame
  //{"frame_id":1548,"objects":[{"class_id":0,"name":"black-cat","relative_coordinates":{"center_x":0.085405,"center_y":0.641437,"width":0.179632,"height":0.54445},"confidence":0.572288}]}

  if (frame.objects.length > 0) {
    // There's something in the frame, take a photo(s)
    let countOfPhotosToTake = 5;
    let hrTime = process.hrtime()
    let hrTimeString = (hrTime[0] * 1000000 + hrTime[1] / 1000).toString();
    hrTimeString = hrTimeString.replace(".", "");

    // Now we have the file name, save the photo
    const file = fs.createWriteStream(`/data/${hrTimeString}.jpg`);
    const request = http.get(`${process.env.MJPEG_STREAM_URL}/?action=snapshot`, function(response) {
      response.pipe(file);
    });
  }

  // Does this frame have a prediction in it?
  //http://10.10.185.120:8080/?action=snapshot
}
