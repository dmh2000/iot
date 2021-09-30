"use strict";

const nmea = require("./nmea");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const os = require("os");
const mqtt = require("mqtt");

function connectHivemq() {
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
    console.log("MQTT",error);
  });

  return client;
}

function sendHivemq(client, data) {
  // don't use leading / on topic
  const topic = "remote/gps";
  // publish message 'Hello' to topic 'my/test/topic'
  console.log("publishing to ", topic);
  client.publish(topic, data);
}

function main() {
  // ================================
  // init mqtt connection
  // ================================
  const client = connectHivemq();

  // ================================
  // set up gps receiver handler
  // ================================

  nmea.setErrorHandler(function (code,msg) {
    if (code != 1) {
      console.log("NMEA",code, msg);
    }
  });

  // creat the serial port streaming object
  const sp = new SerialPort("/dev/ttyACM0", { baudRate: 9600 });

  // create a readline parser
  const parser = new Readline("\r\n");

  // pipe stream input to parser
  sp.pipe(parser);

  // wait for data and send it
  parser.on("data", function (line) {
    // parse the nmea sentence
    const s = nmea.parse(line);
    if (s !== null) {
      // if it was parseable, send it
      if (s.id === "GPGGA") {
        console.log(s.time);
        sendHivemq(client, JSON.stringify(s));
      }
    }
  });
}

main();
