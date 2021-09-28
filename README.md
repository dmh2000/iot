# IOT Quickstart

How to set up IOT on Microsoft Azure. This is a subset that gives a quickstart to get something running. The main documentation is at [Azure IOT Hub Documentation](https://docs.microsoft.com/en-us/azure/iot-hub/).

## Azure Setup

### Create Azure Account

https://microsoft.azure.com

If you don't already have one, you need to create an account. You can create a free account and use free resources for this exercise.

## Azure Quickstart

Azure provides a quickstart you can follow. But it gets a bit complicated because they are in the process of adding features all the time. They provide multiple ways to do the same thing. If you want to do the Azure quickstart, do this:

### Getting to the Quickstart

- Open the Portal (hides under your account icon in upper left)
- - Create A Resource
- select Internet Of Things
- select IOT Hub / **Docs** (Docs, not Create)
  - that sends you to [Quickstart: Send Telemetry](https://docs.microsoft.com/en-us/azure/iot-develop/quickstart-send-telemetry-iot-hub)
  - follow the instructions

However, this only covers the device sending telemetry side of the process, and it has you observe the telemetry in the Azure IOT Explorer App. There is additional work to setting up a 'receiver' app that you can run locally.

## My Quickstart Setup

Hopefully this is pared down to the minimum along with sender and receiver code.

Things to know:

- Every 'app' in Azure is collected into a 'Resource Group' which is the top level container of all the pieces of an app you might use.

### Create An IOT Hub

- Open the Portal (hides under your account icon in upper left)
- Create A Resource

  - select Internet Of Things
  - select IOT Hub / **Create**

  - select the Subscription you want to apply this to
  - you need a resource group, so under the Resource Group box select 'create new' and give it a name
  - give your IOT hub a name
  - select a region

  - select **Networking** at the bottom

    - choose public access (even though it says private is recommended). private is for apps that will live in a cloud virtual network. in this case you will want to access your IOT Hub remotely.

  - select **Management** at the bottom

    - select a tier. scroll down to Free Tier
      - limited to only one IOT Hub for free tier
      - has a quota of max 8000 device messages per day. So if you run the code here, you probably will exceed the quota if you let it run continuously.
    - accept the defaults
      - note that all communication will use TLS (important for security)

  - select Review and Create

    - skip **Tags** for now, not needed here
    - verify free tier
    - verify public access

  - click **Create** at the bottom

  - stay on this page and wait for it to Deploy

### Add A Device

- select **Add and configure IOT Devices**
  - select **+ Add Device**
    - give it an ID, any name is ok
    - accept Authentication Type **Symmetric Key** is easiest for quickstart.
    - let it **Auto-generate** keys
    - enable **Connect this device to a hub**
    - no parent device
    - **Save** at the bottom
  - it goes back to the previous screen
    - select **Find devices** and select the one you just added
    - click to go to the device if it doesn't do it automatically
  - This step is important. The device page has all the keys and connection strings. you will need to copy them to a file for later use
    - copy and save Primary and Secondary Key
    - copy and save Primary and Secondary Connection String
    - leave **Enable Connection to IOT Hub** enabled
  - at the top, select **your iot hub name** to go back to it
  - select **Go To Resource**
    - takes you to the IOT hub

### IOT Hub

you should now be at the main page for your IOT Hub. YOu will see a left sidebar with all the options you will need. Go ahead and select **Explorers - IoT Devices** and you should see your device that you created.

To communicate from the device to the IOT HUB to the client device (your computer) you need an Endpoint. The hub has built in endpoints that use the Azure Event Hub service. But you don't need to know about that. Proceed:

- select **Build-end Endpoints** in the left sidebar

  - don't change anything, just copy and save the **Event Hub-compatible Endpoint** string
  - go back to main IOT Hub page

- select **Shared Access Policies**
  - select _iothubowner_ (basically the root user)
  - copy and save the primary key and primary connection string (these are separate from the device keys and connections)

**IMPORTANT** : keep these keys secret. Don't commit them to Github or any other public place. They give access to your Azure resources!

## My Quickstart Code

The folder 'send' contains code that would reside on a device that sends telemetry. The folder 'recv' contains code that would run on your workstation (for example) and let you monitor device messages.

Both modules rely on some environment variables in the file iot-env.sh (Linux) and iot-env.cmd (Windows). Edit the template file here and save it (but not in a fork of this repo!). Run the file to set the environment variables.

### Set Up The env.sh file

- for Linux, update all the fields in iot-env.sh
- all strings in double quotes!
- for Windows. update all the fields in iot-env.cmd

### Sending

- in a shell (Linux or Windows cmd)
- cd into directory _send_
- npm install
- node _SimulatedDevice.js_
  - you should see some 'message sent' and telemetry data
  - if you see errors, its probably the iot-env.sh file has mistakes, so check it
- go to the Azure web page for your IOT Hub
  - on **Overview - IoT Hub Usage** you should see some message counts updating. you can refresh the page at the top.
  - click on **Show data for last : 1 Hour** to see the recent updates. The graphs should start growing.

#### C Version

- This repo includes a version of a sender written in C. However to get it to work you have to install and build the Azure IOT Device SDK for C, using cmake. It gets reasonably complicated so its not described. here. You can get more info from [Azure IOT Device SDK for C](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-device-sdk-c-intro.)

- the _send_ directory has a makefile and support for building but you would have to install and build the C SDK and set the proper environment variables in the Makefile.

### Receiving

- in a different shell (Linux or Windows cmd)
- cd into directory _recv_
- npm install
- node _ReadDeviceToCloudMessages.js_
- you should see some output of something like

<pre>
event: {
  temperature: 30.186652388302015,
  humidity: 67.26750750748609,
  time: '2021-09-28T17:35:10.739Z'
}
</pre>

## The Code

The Node/JavaScript code uses NPM packages supported by Microsoft and other contributors. You can find the documentation at these locations:

- https://docs.microsoft.com/en-us/azure/developer/javascript
- https://docs.microsoft.com/en-us/javascript/api/@azure/event-hubs/
- https://www.npmjs.com/package/azure-iot-device-mqtt
- https://www.npmjs.com/package/azure-iot-device
- https://github.com/Azure/azure-iot-sdk-node

Note: the libraries also support Typescript (no surprise since Typescript comes from MS).I recommend Typescript if you have a choice.

### Sender

The code is pretty simple. _SimulatedDevice.js_

- imports the required NPM packages

  - azure-iot-device-mqtt
  - azure-iot-device

- creates a DeviceClient object
- sets up a polling interval
- sends a telemetry update when the interval function runs
- the sender just sends random data for temperature, humidity and time.

### Receiver

Again, pretty simple. _ReadDeviceToCloudMessages.js_

- imports the required NPM packages
  - @azure/event-hubs
- creates an EventHubConsumerClient
- subscribes to all events from the sender endpoint
  - provides callback for various events
- sets a timeout to stop running after a while. you can take that out
- starts printing data from received events
  - the code as is prints just the actual telemetry data
  - there is a lot of additional data. The object definition is for [ReceivedEventDat](https://docs.microsoft.com/en-us/javascript/api/@azure/event-hubs/receivedeventdata?view=azure-node-latest)

## Azure IOT Explorer

Microsoft provides a desktop app, **IOT Explorer** that you can use to 'explore' your IOT Hubs and devices. That includes monitoring telemetry data without having to run a separate receiver. That's nice for testing initial device setups.

You can install it from [Install and use Azure IOT Explorer](https://docs.microsoft.com/en-us/azure/iot-fundamentals/howto-use-iot-explorer).

It asks you to add an IOT HUB connection string and it will find all the information about the hub and its devices. This is the IOT Hub Primary connection string you saved during initial setup. If you lost it you can get it back with the Azure Portal page for you IOT hub.

For this app, you can start the sender running. Then go to your hub/Devices/[device name], click on the **Telemetry link** in the left sidebar, and click **Start** along the top. it should start receiving and showing events.

## Conclusions

This is just a smidgen of what you can do with Azure IOT and Azure in general. It gets complicated fast when you want to set up a real system.

The other main cloud providers, AWS and Google have their own suite of IOT support. I found the AWS reasonably easy to use however AWS has so much stuff of all kinds its easy to get lost in there.
