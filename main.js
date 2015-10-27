var lockFile = require('lockfile');
var influx = require('influx');
var Client = require('node-rest-client').Client;

// config
var Config = require('./config.json');

// influx
var client = influx(Object.assign({}, Config.influx));

// rest
rclient = new Client();

// use the same time for all updates in this run
var time = new Date();

// octopi ip
var ip = Config.octoprint.host;

// arguments for the rest client (octoprint api key)
var args = {
  headers: {"X-Api-Key": Config.octoprint.apikey}
};

lockFile.lock('/tmp/felix.lock', function (er) {
  // printer status
  rclient.get("http://"+ip+"/api/printer", args, function(data, response){
    // Bed
    var t_bed = { value : data.temperature.bed.actual, time : time };
    client.writePoint("t_bed", t_bed, {});
    var t_bed_target = { value : data.temperature.bed.target, time : time };
    client.writePoint("t_bed_target", t_bed_target, {});
    // Extruder
    var t_ex = { value : data.temperature.tool0.actual, time : time };
    client.writePoint("t_ex", t_ex, {});
    var t_ex_target = { value : data.temperature.tool0.target, time : time };
    client.writePoint("t_ex_target", t_ex_target, {});
  }).on('error',function(err){
    console.log('something went wrong on the request', err.request.options);
  });

  // job status
  rclient.get("http://"+ip+"/api/job", args, function(data, response){
    // Progress
    var completion = { value : data.progress.completion, time : time };
    client.writePoint("completion", completion, {});

    // Print Time
    var printTime = { value : data.progress.printTime, time : time };
    client.writePoint("printTime", printTime, {});
    var printTimeLeft = { value : data.progress.printTimeLeft, time : time };
    client.writePoint("printTimeLeft", printTimeLeft, {});
  }).on('error',function(err){
    console.log('something went wrong on the request', err.request.options);
  });

  lockFile.unlock('/tmp/felix.lock', function (er) {
    console.log("failed to unlock");
  })
})
