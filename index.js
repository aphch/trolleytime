// index.js

const express	= require('express');
const cors	= require('cors');
const mapsApiKey = require('./mapskey.js');

const app	= express();

const port = 8000;

//

var SeptaApi = require('./app/septaApi/septaApi.js');
var septaApi = new SeptaApi();

var Core = require('./app/process/index.js');

var core = new Core(septaApi, mapsApiKey);

setInterval(core.updateTrips.bind(core), 10000);

setInterval(core.updateTimes.bind(core), 60000, {dir: 'e', dest: {lat: "39.948827", lng: "-75.215103"}});


var tripsMiddleware = function (req, res, next) {
  req.sortedTrips = core.sortedTrips;
  req.activeTrips = core.activeTrips;
  req.timedTrips = core.timedTrips;
  next()
}
//blah

app.use(tripsMiddleware);
app.use(cors({origin: '*'}));
require('./app/routes')(app, core);

app.listen(port, () => {
	console.log('We are live on ' + port);
});

