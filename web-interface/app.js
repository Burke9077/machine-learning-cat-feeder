const express = require('express');
const app = express();

const config = {
  port: 10080
}

app.use(express.static('static'));

app.listen(config.port, () => console.log(`Cat-feeder web app listening on port ${config.port}!`));
