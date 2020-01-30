#include <Servo.h>

Servo leftServo; 
Servo rightServo;

String inByte;
String servoToControl; // String that should always be "L" or "R" for left or right servo
int pos;

void setup() {
  leftServo.attach(9);
  rightServo.attach(10);
  Serial.begin(9600);
}

void loop() {
  // Listen for data on serial port
  if (Serial.available()) {
    // Take in data from the user
    inByte = Serial.readStringUntil('\n'); // read data until newline

    // Did they want the left or right servo?
    servoToControl = inByte.substring(0,1);

    // What position do they want to move the servo to?
    pos = inByte.substring(1).toInt();   // change datatype from string to integer

    if (servoToControl.equals("L")) {
      leftServo.write(pos);
      Serial.print("Left servo in position: ");
      Serial.println(pos);
    } else if (servoToControl.equals("R")) {
      rightServo.write(pos);
      Serial.print("Right servo in position: ");
      Serial.println(pos);
    }
  }
}
