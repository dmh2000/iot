// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

"use strict";

const nmea = require("./nmea");
const SerialPort = require("serialport")
const Readline = require('@serialport/parser-readline');
const os = require('os');

// Get the device connection string to authenticate the device with your IoT hub.
// Configure using the Azure CLI:
// az iot hub device-identity show-connection-string --hub-name {YourIoTHubName} --device-id MyNodeDevice --output table
const connectionString = process.env.IOT_DEVICE_CONNECTION;

// Using the Node.js Device SDK for IoT Hub:
//   https://github.com/Azure/azure-iot-sdk-node
// The sample connects to a device-specific MQTT endpoint on your IoT Hub.
const Mqtt = require("azure-iot-device-mqtt").Mqtt;
const DeviceClient = require("azure-iot-device").Client;
const Message = require("azure-iot-device").Message;

const client = DeviceClient.fromConnectionString(connectionString, Mqtt);

// Create a message and send it to the IoT hub every second
function send(gpgga)  {
  // add hostname
  gpgga.hostname = os.hostname();
  const message = new Message(
    JSON.stringify(gpgga)
  );

  message.properties.add(
    "satellites",
    gpgga.satellites < 4 ? "true" : "false"
  );

  console.log("Sending message: " + message.getData());

  // Send the message.
  client.sendEvent(message, function (err) {
    if (err) {
      console.error("send error: " + err.toString());
    } else {
      console.log("message sent");
    }
  });
}


// ================================
// set up gps receiver handler
// ================================

// don't print errors
nmea.setErrorHandler(function() {});

// creat the serial port streaming object
const sp = new SerialPort("/dev/ttyACM0", { baudRate:9600 });


// create a readline parser
const parser = new Readline("\r\n");

// pipe stream input to parser
sp.pipe(parser);

// wait for data
parser.on('data',function(line) {
  // parse the nmea sentence 
  const s = nmea.parse(line);
  if (s !== null) {
    // if it was parseable, send it
    if (s.id === "GPGGA") {
      console.log(s);
      send(s);
    }
  }
});

