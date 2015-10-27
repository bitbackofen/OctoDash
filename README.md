# OctoDash

> Fetch data from OctoPrint, pass it to InfluxDB and finally visualise it using Grafana

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

Periodically run `main.js`.

## Usage Grafana

Import the `grafana_dashboard_example.json` into Grafana.

![](https://github.com/bitbackofen/OctoDash/raw/master/screenshots/grafana.png)

## License

MIT © [bitbackofen](http://bitbackofen.de/)
