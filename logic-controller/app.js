const request = require('request');
const JSONStream = require('JSONStream');
const es = require('event-stream');

const timeDelay = 5000; // milliseconds to wait before starting business logic

// Wait a bit for darknet to come up first
console.log(`Waiting to start logic-controller`)
setTimeout(() => {
  console.log(`Logic controller starting`);
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

let framesToConsiderForDecisions = 10
let frameBuffer = [];
function addFrameToFrameBuffer(frameData) {
  if (frameBuffer.length == framesToConsiderForDecisions) {
    // The frame buffer is currently full, remove the first frame
    frameBuffer.shift();
  }
  // Add the new record
  frameBuffer.push(frameData);
  return frameBuffer;
}

let screenSize = {
  width: 1280,
  height: 720
}

/*
  ConvertDarknetCoordinateSystemCenterToXy takes the default coordinate system of darknet
    which is centerx%, centery%, width%, height% and converts them to x1, y1, x2, y2
    relative (%) coordinate pairs.
*/
function ConvertDarknetCoordinateSystemCenterToXy(centerx, centery, width, height) {
  let x1 = centerx - (width/2);
  let x2 = x1 + width
  let y1 = centery - (height/2);
  let y2 = y1 + height
  return({
    x1:x1,
    y1:y1,
    x2:x2,
    y2:y2
  });
}

/*
  ConvertRelativeLrCoordinateSystemCenterToXy takes the default coordinates for
    html canvas which is top/left relative (%), height%, width% and converts them
    to x1, y1, x2, y2 relative coordinate pairs.
*/
function ConvertRelativeLrCoordinateSystemCenterToXy(leftx, topy, width, height) {
  let x1 = leftx;
  let x2 = x1 + width
  let y1 = topy;
  let y2 = y1 + height
  return({
    x1:x1,
    y1:y1,
    x2:x2,
    y2:y2
  });
}

/*
  determineRectanglesOverlapPercent takes in 2 rectangle objects in the format
  of x1, y1, x2, y2 and computes the area of overlap which works out to be a percentage
  since all the rectangles in this program are relative percentages already.

  Algorithm: https://math.stackexchange.com/questions/99565/simplest-way-to-calculate-the-intersect-area-of-two-rectangles
*/

function determineRectanglesOverlapPercent(rect1, rect2) {
  // x_overlap = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
  let x_overlap = Math.max(0, Math.min(rect1.x1 + rect1.x2, rect2.x1 + rect2.x2) - Math.max(rect1.x1, rect2.x1));
  // y_overlap = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
  let y_overlap = Math.max(0, Math.min(rect1.y1 + rect1.y2, rect2.y1 + rect2.y2) - Math.max(rect1.y1, rect2.y1));

  return (x_overlap * y_overlap);
}

let catGeofenceCoords = {
  greyCat: ConvertRelativeLrCoordinateSystemCenterToXy(0.55, 0.1, 0.32, 0.85),
  blackCat: ConvertRelativeLrCoordinateSystemCenterToXy(0.08, 0.1, 0.32, 0.85)
}

/*
  The stream we are given is one frame at a time. For each frame, process the
  frame and put it in the frame buffer. This helps to evaluate frames over time
  so decisions aren't made with jittery data.
*/
function processFrame(frame) {
  // Print the frame
  console.log(JSON.stringify(frame));

  let processedFrame = {
    black_cat: null,
    grey_cat: null
  }

  for (let i=0; i<frame.objects.length; i++) {
    // We have found an object (cat) in the frame, add its info
    let catCoords = ConvertDarknetCoordinateSystemCenterToXy(
      frame.objects[i].relative_coordinates.center_x,
      frame.objects[i].relative_coordinates.center_y,
      frame.objects[i].relative_coordinates.width,
      frame.objects[i].relative_coordinates.height
    );

    let catObject = {
      coords: catCoords,
      confidence: frame.objects[i].confidence,
      overlap: {
        blackCatOverlap: determineRectanglesOverlapPercent(catCoords, catGeofenceCoords.blackCat),
        greyCatOverlap: determineRectanglesOverlapPercent(catCoords, catGeofenceCoords.greyCat)
      },
      name: null
    }

    if (frame.objects[i].name === "black-cat") {
      // We have found luna
      catObject.name = "black-cat"
      processedFrame.black_cat = catObject
    } else if (frame.objects[i].name === "grey-cat") {
      // We have found jellybean
      catObject.name = "grey-cat"
      processedFrame.grey_cat = catObject
    }
  }

  // Add this new frame to the frame buffer
  newFrameBuffer = addFrameToFrameBuffer(processedFrame)

  // We now have our frame buffer, lets analyze it to see if we need to take any action
  analyzeFrameBuffer(newFrameBuffer);
}

/*
  AnalyzeFrameBuffer takes a look at the last # of slides and makes a decision
  on what to do.
*/
function analyzeFrameBuffer(testData) {
  // Do we have enough data?
  if (testData.length >= framesToConsiderForDecisions) {
    // We have enough data, start analyzing
    let catZonePercentage = calculatePercentOfCatInZones(testData);

    // We now have the confidence of what cat is in what zone
    /*  catZonePercentage
        {
            "blackCat": {
                "blackCatZoneAverage": 0,
                "greyCatZoneAverage": 0
            },
            "greyCat": {
                "blackCatZoneAverage": 0,
                "greyCatZoneAverage": 0.6091347455123999
            }
        }
    */

    let shouldUnlockGrey= false;
    let shouldUnlockBlack= false;

    if (catZonePercentage.blackCat.blackCatZoneAverage > catZonePercentage.greyCat.greyCatZoneAverage) {
      // Black cat is in the black cat zone
      shouldUnlockBlack = true;
    }

    if (catZonePercentage.greyCat.greyCatZoneAverage > catZonePercentage.blackCat.blackCatZoneAverage) {
      // Grey cat is in the grey cat zone
      shouldUnlockGrey = true;
    }

    // We have our final decision, pass it to the door controller
    processDoorController(shouldUnlockBlack, shouldUnlockGrey)
  } else {
    console.log(`Not enough frames to consider`)
  }
}

function calculatePercentOfCatInZones(catDataArray) {
  let resultData = {
    blackCat: {
      blackCatZoneAverage: 0,
      greyCatZoneAverage: 0
    },
    greyCat: {
      blackCatZoneAverage: 0,
      greyCatZoneAverage: 0
    }
  }

  // How many frames did we really process?
  let framesConsidered = 0;

  for (let i=0; i<catDataArray.length; i++) {
    // Start by upping the counter
    framesConsidered = framesConsidered + 1;

    let currentCatData = catDataArray[i];

    // Is black cat in frame?
    if (currentCatData.black_cat != null) {
      // Black cat is in frame, add its percent in the zone to total
      resultData.blackCat.blackCatZoneAverage += currentCatData.black_cat.overlap.blackCatOverlap;
      resultData.blackCat.greyCatZoneAverage += currentCatData.black_cat.overlap.greyCatOverlap;
    }

    // Is grey cat in frame?
    if (currentCatData.grey_cat != null) {
      // Grey cat is in frame, add its percent in the zone to total
      resultData.greyCat.blackCatZoneAverage += currentCatData.grey_cat.overlap.blackCatOverlap;
      resultData.greyCat.greyCatZoneAverage += currentCatData.grey_cat.overlap.greyCatOverlap;
    }
  }

  // We've now processed all cats in the buffer so we need to compute the average
  resultData.blackCat.blackCatZoneAverage = resultData.blackCat.blackCatZoneAverage / framesConsidered;
  resultData.blackCat.greyCatZoneAverage = resultData.blackCat.greyCatZoneAverage / framesConsidered;

  resultData.greyCat.blackCatZoneAverage = resultData.greyCat.blackCatZoneAverage / framesConsidered;
  resultData.greyCat.greyCatZoneAverage = resultData.greyCat.greyCatZoneAverage / framesConsidered;
  let finalANalys = JSON.stringify(resultData, null, 4);
  console.log(`Printing final analysis\n${finalANalys}`)

  return(resultData);
}

/*
  processDoorController takes in true/false for blackCatDoor and greyCatDoor
  and then locks/unlocks accordingly
*/
function processDoorController(shouldUnlockBlack, shouldUnlockGrey) {
  if (shouldUnlockBlack == true) {
    // Unlock it
    request('http://localhost:8000/v1/device/right/setPower/on', function(err, res, body) {
        console.log(JSON.stringify({err: err, body: body}));
    });
  } else {
    // Lock it
    request('http://localhost:8000/v1/device/right/setPower/off', function(err, res, body) {
        console.log(JSON.stringify({err: err, body: body}));
    });
  }

  if (shouldUnlockGrey == true) {
    // Unlock it
    request('http://localhost:8000/v1/device/left/setPower/on', function(err, res, body) {
        console.log(JSON.stringify({err: err, body: body}));
    });
  } else {
    // Lock it
    request('http://localhost:8000/v1/device/left/setPower/off', function(err, res, body) {
        console.log(JSON.stringify({err: err, body: body}));
    });
  }
}
