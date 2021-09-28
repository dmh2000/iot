// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

"use strict";

// Get the device connection string to authenticate the device with your IoT hub.
// Configure using the Azure CLI:
// az iot hub device-identity show-connection-string --hub-name {YourIoTHubName} --device-id MyNodeDevice --output table
var connectionString = process.env.IOT_DEVICE_CONNECTION;

// Using the Node.js Device SDK for IoT Hub:
//   https://github.com/Azure/azure-iot-sdk-node
// The sample connects to a device-specific MQTT endpoint on your IoT Hub.
var Mqtt = require("azure-iot-device-mqtt").Mqtt;
var DeviceClient = require("azure-iot-device").Client;
var Message = require("azure-iot-device").Message;

var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

// Create a message and send it to the IoT hub every second
setInterval(function () {
  // Simulate telemetry.
  var temperature = 20 + Math.random() * 15;
  var message = new Message(
    JSON.stringify({
      temperature: temperature,
      humidity: 60 + Math.random() * 20,
      time: new Date().toISOString(),
    })
  );

  // Add a custom application property to the message.
  // An IoT hub can filter on these properties without access to the message body.
  message.properties.add(
    "temperatureAlert",
    temperature > 30 ? "true" : "false"
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
}, 1000);
