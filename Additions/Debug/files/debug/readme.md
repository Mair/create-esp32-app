
# DEBUGGING

You will need an FT2322 in order to use a jtag. you can get them for about $10.00 on ali express.

wire up the FT2322 and the esp32 as follows

![FT2322 jtag debugging][FT2322-jtag]

[FT2322-jtag]: /misc/pin%20mapping.svg "Logo Title Text 2"

| FT2322 Pin Name | FT2322 pin number | ESP32 pin name| ESP32 pin number
| --------------- |:-----------------:|:-------------:|:-------------:|
| TCK             | ADBUS 0           | 13            | MTCK  
| TDI             | ADBUS 1           | 12            | MTDI
| TDO             | ADBUS 2           | 15            | MTDO
| TMS             | ADBUS 3           | 14            | MTMS
| GND             |                   | GND           |

start the debugger by using

```
openocd -f debug\ftdi_ft2322.cfg -f debug\esp-wroom-32.cfg
```
