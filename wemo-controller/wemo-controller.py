import pywemo
import sys

# Get arguments from the command line. We're expecting
#
# Arg1: ip address of the device to change power state
# Arg2: "on" or "off"
deviceIP = sys.argv[1]
powerOnOrOff = sys.argv[2]

# Setup the device
port = pywemo.ouimeaux_device.probe_wemo(deviceIP)
url = 'http://%s:%i/setup.xml' % (deviceIP, port)
device = pywemo.discovery.device_from_description(url, None)

# Set the power as requested
if powerOnOrOff == "on":
    device.on()
elif powerOnOrOff == "off":
    device.off()
