// app/process/index.js
const http = require('http');

var Core = function(sApi, mapsKey) {

	this.activeTrips = [];
	this.sortedTrips = [];
	this.timedTrips = [];
	this.mapsKey = mapsKey;

	this.updateTimes = function(args) {

		const https = require('https');
		var url = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=";

		tripsToUpdate = this.sortedTrips.filter(trip =>
			(trip.ComputedDirection == args.dir && (
				(args.dir == 'e' && parseFloat(trip.currentLatLng.lng) < parseFloat(args.dest.lng)) || (args.dir == 'w' && parseFloat(trip.currentLatLng.lng) > parseFloat(args.dest.lng))
			))
		);

		originString = "";

		for (i in tripsToUpdate) {

			if (originString !== "") {
				originString += "|";
			}

			trip = tripsToUpdate[i];

			originString += trip.currentLatLng.lat + "," + trip.currentLatLng.lng;
		}

		url += originString;

		url += "&destinations=" + args.dest.lat + "," + args.dest.lng;

		url += "&key=" + this.mapsKey;

		console.log(url);

		if (originString !== "") {
			https.get(url, r => {
				let body = "";
				r.on("data", data => {
					body += data;
				});
				r.on("end", () => {
					body = JSON.parse(body);
					this.timedTrips = body;
					console.log(body);
				});
			});
		} else {
			this.timedTrips = [];
		}
	}

	this.updateTrips = function() {

		const url = "http://www3.septa.org/hackathon/TransitView/trips.php?route=34";

		sApi.getTrips("34", function(body) {
			this.activeTrips = body["bus"];

			for (activeBusIndex in this.activeTrips) {
				activeBus = this.activeTrips[activeBusIndex];
				isSorted = false;
				for (sortedBusIndex in this.sortedTrips) {
					sortedBus = this.sortedTrips[sortedBusIndex];
					if (sortedBus.TripID === activeBus.TripID) {
						isSorted = true;
						if (parseFloat(activeBus.lng) > parseFloat(sortedBus.lng)) {
							activeBus.ComputedDirection = 'e';
							sortedBus.ComputedDirection = 'e';
						} else if (parseFloat(activeBus.lng) < parseFloat(sortedBus.lng)) {
							activeBus.ComputedDirection = 'w';
							sortedBus.ComputedDirection = 'w';
						} else {
							activeBus.ComputedDirection = sortedBus.ComputedDirection;
						}
						activeBus.initialLng = sortedBus.lng;
						sortedBus.currentLatLng = {
							lat: activeBus.lat,
							lng: activeBus.lng
						};
					}
				}
				if (!isSorted) {
					activeBus.ComputedDirection = 'u';
					this.sortedTrips.push(activeBus);
				}
			}

			console.log(this.sortedTrips);

			for (sortedBusIndex in this.sortedTrips) {
				sortedBus = this.sortedTrips[sortedBusIndex];
				isActive = false;
				for (activeBusIndex in this.activeTrips) {
					activeBus = this.activeTrips[activeBusIndex];
					if (activeBus.TripID === sortedBus.TripID) {
						isActive = true;
						break;
					}
				}

				if (!isActive) {
					this.sortedTrips.splice(sortedBusIndex, 1);
				}
			}


			//this.sortedTrips = this.activeTrips;

		}.bind(this));

	}

	this.showTrips = function() {
		console.log(this.activeTrips);
	}

}

module.exports = Core;