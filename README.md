Rooms management is an application destinated to people who want to keep the track of other people (e.g. teacher wants to know if their students are in class). Rooms management is a good way to know who enters your own territory. 
In rooms management you can create your own "room" and invite other people to enter it (by giving them an access code) and see if they are in your room or not (by checking the geolocation). You may ask how is this application knowing if you are in a certain area or not. Well, all you have to do when you create your room is to go in each corner of it and press a button to register the current location, then the app will know if somebody from your room enters or leaves it. Application gives you notifications when somebody from your room goes in or out of it.Also, the admin of the "room" has access to everyone's current status.

This software uses React Native with Expo for FrontEnd, NodeJS for BackEnd and MySQL for local database, socketIO for receiving notifications in real-time. 
The "room" is being scanned with geolocation (every corner position). 
Everyone in the virtual room has geolocation up to date, using phone's motion sensor.
