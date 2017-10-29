module.exports = function(app, core) {

	const http = require("http");

	app.get('/routes/:num', (req, res) => {
		const num = req.params.num;
		const url = "http://www3.septa.org/hackathon/TransitView/trips.php?route=" + num;

		http.get(url, r => {
			let body = "";
			r.on("data", data => {
				body += data;
			});
			r.on("end", () => {
				body = JSON.parse(body);
				console.log(body);
				res.send(body);
			});
		});

	});

	app.get('/sorted/routes/:dir', (req, res) => {

		const dir = req.params.dir

		console.log(req.activeTrips);

		res.send(req.activeTrips.filter(trip => (
			trip.ComputedDirection == dir &&
			((trip.ComputedDirection == 'e' && parseFloat(trip.lng) < -75.214968) ||
				(trip.ComputedDirection == 'w' && parseFloat(trip.lnt) > -75.214968))
		)));

	});

	app.get('/timed', (req, res) => {
		res.send(req.timedTrips);
	});

	app.get('/activetrips', (req, res) => {
		res.send(req.activeTrips);
	})

};