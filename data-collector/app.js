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
  try {
    request({url: 'http://localhost:9070'})
      .on('error', (err) => {
        console.error("Entering error block");
        console.error(JSON.stringify(err, null, 4));
        console.error("Restarting function");
        beginProcessingRecords();
      })
      .pipe(JSONStream.parse('*'))
      .pipe(es.mapSync(function (data) {
        processFrame(data)
        return data
      }));
  } catch (e) {
    console.error("Entering catch block");
    console.error(JSON.stringify(e, null, 4));
    console.error("Restarting function");
    beginProcessingRecords();
  }
}

/*
  For each frame with a prediction, save that frame for analysis later
*/
function processFrame(frame) {
  // Print the frame
  //{"frame_id":1548,"objects":[{"class_id":0,"name":"black-cat","relative_coordinates":{"center_x":0.085405,"center_y":0.641437,"width":0.179632,"height":0.54445},"confidence":0.572288}]}

  if (frame.objects.length > 0) {
    // There's something in the frame, how confident are we in the object?
    let lowConfidenceThreshold = 0.7 // Capture anything less than 70% confidence

    // First find what the lowerst confidence object in the frame is
    let lowestConfidence = 100;
    for (let i=0; i<frame.objects.length; i++) {
      if (frame.objects[i].confidence < lowestConfidence) {
        // This is our new lowest confidence object
        lowestConfidence = frame.objects[i].confidence;
      }
    }

    // Is the object low enough confidence to take a snapshot?
    if (lowestConfidence < lowConfidenceThreshold) {
      // Yes we want to record this
      let hrTime = process.hrtime()
      let hrTimeString = (hrTime[0] * 1000000 + hrTime[1] / 1000).toString();
      hrTimeString = hrTimeString.replace(".", "");

      // Now we have the file name, save the photo
      let file = fs.createWriteStream(`/data/${hrTimeString}.jpg`);
      let request = http.get(`${process.env.MJPEG_STREAM_URL}/?action=snapshot`, function(response) {
        response.pipe(file);
      });

      // Save the prediction to a file
      predictedRecord = "";
      for (let i=0; i<frame.objects.length; i++) {
        predictedRecord = predictedRecord + "\n" + `${frame.objects[i].class_id} ${frame.objects[i].relative_coordinates.center_x} ${frame.objects[i].relative_coordinates.center_y} ${frame.objects[i].relative_coordinates.width} ${frame.objects[i].relative_coordinates.height}`
      }
      predictedRecord = predictedRecord.trim();

      let predictedLabelFile = fs.writeFile(`/data/${hrTimeString}.txt`, predictedRecord, (err) => {
        console.error(`Error on creating file /data/${hrTimeString}.txt`);
        console.error(JSON.stringify(err, null, 4));
      })
    }
  }
}
