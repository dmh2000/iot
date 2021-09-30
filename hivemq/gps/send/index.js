"use strict";

const nmea = require("./nmea");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const os = require("os");
const mqtt = require("mqtt");

function sendHivemq(data) {
  const options = {
    host: process.env.HIVEMQ_HOST,
    port: 8883,
    protocol: "mqtts",
    username: process.env.HIVEMQ_USERID,
    password: process.env.HIVEMQ_PASSWORD,
  };

  //initialize the MQTT client
  const client = mqtt.connect(options);

  //setup the callbacks
  client.on("connect", function () {
    console.log("Connected");
  });

  client.on("error", function (error) {
    console.log(error);
  });

  let count = 0;
  // don't use leading / on topic
  const topic = "remote/gps";
  setInterval(() => {
    // publish message 'Hello' to topic 'my/test/topic'
    console.log("publishing to ", topic);
    client.publish(topic, data);
    count++;
  }, 2000);
}

// ================================
// set up gps receiver handler
// ================================

nmea.setErrorHandler(function (e) {
  console.log(e);
});

// creat the serial port streaming object
const sp = new SerialPort("/dev/ttyACM0", { baudRate: 9600 });

// create a readline parser
const parser = new Readline("\r\n");

// pipe stream input to parser
sp.pipe(parser);

// wait for data
parser.on("data", function (line) {
  // parse the nmea sentence
  const s = nmea.parse(line);
  if (s !== null) {
    // if it was parseable, send it
    if (s.id === "GPGGA") {
      console.log(s);
      sendHivemq(s);
    }
  }
});
