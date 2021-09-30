const mqtt = require("mqtt");

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
setInterval(() => {
  // publish message 'Hello' to topic 'my/test/topic'
  console.log("publish ", count, " to my/test/topic");
  client.publish("my/test/topic", count.toString());
  count++;
}, 2000);
