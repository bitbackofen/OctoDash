'use strict';
var lockFile = require('lockfile');
var influx = require('influx');
var Client = require('node-rest-client').Client;

// config
var Config = require('./config.json');

// influx
var client = influx(Object.assign({}, Config.influx));

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
		client.writePoint('t_bed', tBed, {});
		var tBedTarget = {value: data.temperature.bed.target, time: time};
		client.writePoint('t_bed_target', tBedTarget, {});
		// Extruder
		var tEx = {value: data.temperature.tool0.actual, time: time};
		client.writePoint('t_ex', tEx, {});
		var tExTarget = {value: data.temperature.tool0.target, time: time};
		client.writePoint('t_ex_target', tExTarget, {});
	}).on('error', function (err) {
		console.log('something went wrong on the request', err.request.options);
	});

	// job status
	rclient.get('http://' + ip + '/api/job', args, function (data) {
		// Only update the job status while the printer is printing
		if(data.state == "Printing" || data.state == "Paused") {
			// Progress
			var completion = {value: data.progress.completion, time: time};
			client.writePoint('completion', completion, {});
	
			// Print Time
			var printTime = {value: data.progress.printTime, time: time};
			client.writePoint('printTime', printTime, {});
			var printTimeLeft = {value: data.progress.printTimeLeft, time: time};
			client.writePoint('printTimeLeft', printTimeLeft, {});
		}
	}).on('error', function (err) {
		console.log('something went wrong on the request', err.request.options);
	});

	lockFile.unlock('/tmp/felix.lock', function () {
		console.log('failed to unlock');
	});
});
