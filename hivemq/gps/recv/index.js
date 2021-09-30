const mqtt = require("mqtt");
const os = require("os");

const options = {
  host: process.env.HIVEMQ_HOST,
  port: 8883,
  protocol: "mqtts",
  username: process.env.HIVEMQ_USERID,
  password: process.env.HIVEMQ_PASSWORD,
};

// don't use leading / on topic
const topic = "remote/gps";

//initialize the MQTT client
const client = mqtt.connect(options);

//setup the callbacks
client.on("connect", function () {
  console.log("Connected");
  console.log("subscribed to", topic);
});

client.on("error", function (error) {
  console.log(error);
});

client.on("message", function (topic, message) {
  //Called each time a message is received
  console.log("Received message:", topic, message.toString());
});

// subscribe to topic
client.subscribe(topic);
