'use strict';
var lockFile = require('lockfile');
var influx = require('influx');
var Client = require('node-rest-client').Client;

// config
var Config = require('./config.json');

// influx
var client = new influx.InfluxDB(Object.assign({}, Config.influx));

// rest
var rclient = new Client();

// use the same time for all updates in this run
var time = new Date();

// octopi ip
var ip = Config.octoprint.host;

// arguments for the rest client (octoprint api key)
var args = {
	headers: {'X-Api-Key': Config.octoprint.apikey}
};

lockFile.lock('/tmp/felix.lock', function () {
	// printer status
	rclient.get('http://' + ip + '/api/printer', args, function (data) {
		// Bed
		var tBed = {value: data.temperature.bed.actual, time: time};
		var tBedTarget = {value: data.temperature.bed.target, time: time};
		// Extruder
		var tEx = {value: data.temperature.tool0.actual, time: time};
		var tExTarget = {value: data.temperature.tool0.target, time: time};

		client.writeMeasurement(
			'temperature', [
				{
					fields: {
						t_bed: tBed.value,
						t_bed_target: tBedTarget.value,
						t_ex: tEx.value,
						t_ex_target: tExTarget.value
					},
				}
			]
		).catch(err => {
			console.error(`Error saving data to InfluxDB! ${err.stack}`)
		})

	}).on('error', function (err) {
		console.log('something went wrong on the request', err.request.options);
	});


	// job status
	rclient.get('http://' + ip + '/api/job', args, function (data) {
		// Status
		var status = {value: data.state, time: time};

		client.writeMeasurement(
			'status', [
				{
					fields: {
						status: status.value
					}
				}
			]
		)

		// Only update the job status while the printer is printing
		if(data.state == "Printing" || data.state == "Paused") {
			// Progress
			var completion = {value: data.progress.completion, time: time};

			// Print Time
			var printTime = {value: data.progress.printTime, time: time};
			var printTimeLeft = {value: data.progress.printTimeLeft, time: time};

			client.writeMeasurement(
			'status', [
				{
					fields: {
						completion: completion.value,
						printTime: printTime.value,
						printTimeLeft: printTimeLeft.value,
					},
				}
			]
		)
		}
	}).on('error', function (err) {
		console.log('something went wrong on the request', err.request.options);
	});

	lockFile.unlock('/tmp/felix.lock', function () {
		console.log('failed to unlock');
	});
});
