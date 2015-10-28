# OctoDash

Useful for plotting your 3D printer progress.

## Install

Clone this repository and run:

```
$ npm install
```

Package on npm is coming soon.

## Requirements

This script relies on the following (already configured) software:

- InfluxDB
- OctoPrint
- Grafana

## Usage script

Copy `config.json.example` to `config.json` and add your values.

Periodically run `main.js`. For example with a cron job:

```
* * * * * <username> node /usr/local/src/OctoDash/main.js
```

This will update the database with the latest information every minute.

## Usage Grafana

Import the `grafana_dashboard_example.json` into Grafana.

![](https://github.com/bitbackofen/OctoDash/raw/master/screenshots/grafana.png)

## License

MIT © [bitbackofen](http://bitbackofen.de/)
