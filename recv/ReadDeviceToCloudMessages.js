// https://docs.microsoft.com/en-us/javascript/api/@azure/event-hubs/?view=azure-node-latest
// https://www.npmjs.com/package/@azure/event-hubs#consume-events-in-a-single-process

const {
  EventHubConsumerClient,
  earliestEventPosition,
  latestEventPosition,
} = require("@azure/event-hubs");

async function main() {
  console.log(process.env.IOT_HUB_ENDPOINT_GROUP);
  // Endpoint connection string (NOT device connection string)
  console.log(process.env.IOT_HUB_ENDPOINT_CONNECTION);
  // Event Hub-Compatible Name
  console.log(process.env.IOT_HUB_ENDPOINT_NAME);

  // get the following from iot-hub name : Built-in-Endpoints
  const client = new EventHubConsumerClient(
    // default consumer group
    process.env.IOT_HUB_ENDPOINT_GROUP,
    // Endpoint connection string (NOT device connection string)
    process.env.IOT_HUB_ENDPOINT_CONNECTION,
    // Event Hub-Compatible Name
    process.env.IOT_HUB_ENDPOINT_NAME
  );

  // start receiving at the latest event. you could use 'earliestEventPosition to
  // see all the messages from when the device started
  const subscriptionOptions = {
    startPosition: latestEventPosition,
  };

  const subscription = client.subscribe(
    {
      processEvents: async (events, context) => {
        // event processing code goes here
        // the events object has a lot of information.
        // this just prints the actual data
        if (events[0]) {
          console.log("event:", events[0].body);
          console.log("props:", events[0].properties);
          console.log();
        } else {
          console.log(events);
        }
      },
      processError: async (err, context) => {
        // error reporting/handling code here
        console.log(err);
      },
    },
    subscriptionOptions
  );

  // Wait for a few seconds to receive events before closing
  setTimeout(async () => {
    await subscription.close();
    await client.close();
    console.log(`Exiting sample`);
  }, 60 * 30 * 1000);
}

main();
