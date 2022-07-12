import React, {useState, useEffect} from "react";
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager'; 
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UserGeolocation({socket, id, rooms, email, username, statusCallback, subStatusCallback }) {

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [locationText, setLocationText] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [start, setStart] = useState(false);
    const [userInRoom, setUserInRoom] = useState(null);
    const [foundRooms, setRooms] = useState(rooms);


    useEffect(() => {
        console.log("Boys", id);
        // socket.emit("server_geolocation", roomId);
        // socket.on("get_coords", bruteCoords => {
        //     const coords = bruteCoords.split(" ");
        //     setMinLat(coords[0]);
        //     setMaxLat(coords[1]);
        //     setMinLong(coords[2]);
        //     setMaxLong(coords[3]);
        //     setStart(true);
        //     console.warn("Data: ", bruteCoords);
        // });
    }, []);


    TaskManager.defineTask('trackLocation', ({ data: { locations }, error }) => {
        if (error) return;   
        console.log('Received new locations', locations);
    });

    useEffect(() => {
        (async () => {
            if (location) return;
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            
            const newLocation = await Location.getCurrentPositionAsync({});
            setStart(true);
            setLocation(newLocation);
            setLongitude(newLocation.coords.longitude.toFixed(5));
            setLatitude(newLocation.coords.latitude.toFixed(5));

            await watchPosition();
        })();
    }, []);

    useEffect(async () => {
        console.log("Before start", latitude, longitude);
        if (!start) return;
        console.log("New data", latitude, longitude);

        socket.emit("get_rooms", email, async rooms => {
            const newRooms = rooms;
            const roomsStatus = [], subRoomsStatus = [];
            newRooms && newRooms.forEach((currRoom, idx) => {

                subRoomsStatus.push([]);
                currRoom.subRooms && currRoom.subRooms.forEach((subRoom, subRoomIdx) => {
                    const subGeolocationData = subRoom["geolocation"].split(" ");
                    const subMinLat = parseFloat(subGeolocationData[0]).toFixed(5);
                    const subMaxLat = parseFloat(subGeolocationData[1]).toFixed(5);
                    const subMinLong = parseFloat(subGeolocationData[2]).toFixed(5);
                    const subMaxLong = parseFloat(subGeolocationData[3]).toFixed(5);
                    const subOldStatus = newRooms[idx].subRooms[subRoomIdx]["userStatus"];
                    console.warn(subOldStatus);
                    newRooms[idx].subRooms[subRoomIdx]["userStatus"] = longitude >= subMinLong && longitude <= subMaxLong && latitude >= subMinLat && latitude <= subMaxLat;
                    //subOldStatus !== newRooms[idx].subRooms[subRoomIdx]["userStatus"] && socket.emit("change_status", currRoom["roomId"], currRoom["userStatus"], currRoom["id"]);
                    if (subOldStatus !== newRooms[idx].subRooms[subRoomIdx]["userStatus"]) {
                        socket.emit("send_notification", currRoom["username"], `${currRoom["roomName"]}`, newRooms[idx]["userStatus"] ? `${currRoom["username"]} entered into the subroom ${subRoom["roomName"]}!` : `${currRoom["username"]} is no longer into the subroom ${subRoom["roomName"]}!`);
                    }
                    subRoomsStatus[idx].push(newRooms[idx].subRooms[subRoomIdx]["userStatus"]);
                });

                const geolocationData = currRoom["geolocation"].split(" ");
                const minLat = parseFloat(geolocationData[0]);
                const maxLat = parseFloat(geolocationData[1]);
                const minLong = parseFloat(geolocationData[2]);
                const maxLong = parseFloat(geolocationData[3]);
                const oldStatus = newRooms[idx]["userStatus"];
                newRooms[idx]["userStatus"] = longitude >= minLong && longitude <= maxLong && latitude >= minLat && latitude <= maxLat;
                oldStatus !== newRooms[idx]["userStatus"] && socket.emit("change_status", currRoom["roomId"], currRoom["userStatus"], currRoom["id"]);

                if (oldStatus !== newRooms[idx]["userStatus"] && !currRoom.admin) {
                    socket.emit("send_notification", currRoom["username"], `${currRoom["roomName"]}`, newRooms[idx]["userStatus"] ? `${username} entered in the room!` : `${username} is no longer in the room!`);
                }

                setRooms(newRooms);
                console.warn("Status", idx, newRooms[idx]["userStatus"]);
                roomsStatus.push(newRooms[idx]["userStatus"]);
                socket.emit("update_rooms", email, JSON.stringify(newRooms));
            });
            statusCallback(roomsStatus);
            subStatusCallback(subRoomsStatus);
            setRooms(newRooms);
            await AsyncStorage.setItem("rooms", JSON.stringify(newRooms));
        });
    
    }, [latitude, longitude]);



    const watchPosition = async () => {

        const options = { 
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 0.1,
            //deferredUpdatesInterval: 10,
        }; 

        await Location.watchPositionAsync(options, loc => {  
            console.log("New location here: ", loc);
            setLongitude(loc.coords.longitude.toFixed(5));
            setLatitude(loc.coords.latitude.toFixed(5));
        });  
    };

    return null;
};
