# GPS Sample

You need a GPS device that has a /dev/tty??? device name for this to work. I used a UBLOX USB GPS dongle.

Important : when you do "npm install" the 'serialport' package may need to build some C files for the specific platform. For x86-64 systems (windows and linux) it will probably not need to, but for arm, like Raspberry PI it may want to build. It uses node-gyp which expects a C compiler system installed.

Look here for more information :

https://serialport.io/docs/guide-installation
https://github.com/nodejs/node-gyp

For Raspberry PI specifically, you just need:wq
$sudo apt install build-essential
