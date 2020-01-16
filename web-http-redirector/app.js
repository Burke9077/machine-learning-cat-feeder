const express = require('express');
const app = express();

const config = {
  port: 8100
}

app.get("*", function(request, response){
  response.redirect("https://" + request.headers.host + request.url);
});

app.listen(config.port, () => console.log(`Https redirect app listening on port ${config.port}!`));
