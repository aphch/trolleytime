var SeptaApi = function() {

	this.getTrips = function(routeNum, cb) {
		const http = require('http');

		const url = "http://www3.septa.org/hackathon/TransitView/trips.php?route="+routeNum;

		http.get(url, r => {
			let body = "";
			r.on("data", data => {
				body += data;
			});
			r.on("end", () => {
				body = JSON.parse(body);
				cb(body);
			});
		});

	}

};



module.exports = SeptaApi;