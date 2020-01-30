const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const express = require('express');
const app = express();

const config = {
  port: 13000,
}

// Open the port
let port = new SerialPort('/dev/ttyACM0', { baudRate: 9600 });
let parser = port.pipe(new Readline({ delimiter: '\n' }));

// Setup the function that will move our motors
function moveMotor(leftOrRight, position) {
  // Write the record out to the log
  console.log(`Moving motor ${leftOrRight} to position ${position}`);
  // Read the port data
  port.on("open", () => {
    console.log('serial port open');
  });
  parser.on('data', data =>{
    console.log('got word from arduino:', data);
  });

  // Write our message
  port.write(`${leftOrRight}${position}`, (err) => {
    if (err) {
      return console.error(JSON.stringify(err, null, 4));
    }
  });
}

// Define default route for testing
app.get('/', (req, res) => res.send('Hello World!'));

// Setup code to turn on/off the left/right light and punt the work to python
app.get('/v1/motor/:motor/position/:position', (request, response) => {
  /*
    The :device variable expects "L" or "R". This could be parameterized to work for
    more than 2 examples but I don't want to encourage myself to get another cat.
  */
  let leftOrRightDevice = request.params.motor;

  // The position variable will be a positional number between 0 and 180.
  let deviceDesiredPowerState = request.params.position;

  if (leftOrRightDevice === "L" || leftOrRightDevice === "R") {
    moveMotor(leftOrRightDevice, deviceDesiredPowerState)
    response.status(200).json({message: `Okay`});
  } else {
    response.status(422).json({message: `Can't understand input`})
  }
});

app.listen(config.port, () => console.log(`Motor controller controller app listening on port ${config.port}!`));
