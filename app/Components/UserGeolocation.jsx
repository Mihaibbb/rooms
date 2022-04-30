import React, {useState, useEffect} from "react";
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager'; 

export default function UserGeolocation({ roomId, socket, id }) {

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [locationText, setLocationText] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [start, setStart] = useState(false);
    const [userInRoom, setUserInRoom] = useState(null);

    const [minLat, setMinLat] = useState(null);
    const [minLong, setMinLong] = useState(null);
    const [maxLat, setMaxLat] = useState(null);
    const [maxLong, setMaxLong] = useState(null);

    useEffect(() => {
        if (!roomId) return;
        console.warn("Boys", roomId, id);
        socket.emit("server_geolocation", roomId);
        socket.on("get_coords", bruteCoords => {
            const coords = bruteCoords.split(" ");
            setMinLat(coords[0]);
            setMaxLat(coords[1]);
            setMinLong(coords[2]);
            setMaxLong(coords[3]);
            setStart(true);
            console.warn("Data: ", bruteCoords);
        });
    }, [roomId]);

    TaskManager.defineTask('trackLocation', ({ data: { locations }, error }) => {
        if (error) return;   
        console.warn('Received new locations', locations);
    });

    useEffect(() => {
        (async () => {
            if (location) return;
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }
            
            let newLocation = await Location.getCurrentPositionAsync({});
            setLocation(newLocation);
            setLongitude(newLocation.coords.longitude.toFixed(4));
            setLatitude(newLocation.coords.latitude.toFixed(4));

            await watchPosition();
        })();
    }, []);

    useEffect(() => {
        if (userInRoom === null) return;
        console.warn("In room: ", userInRoom, id);
        socket.emit("change_status", roomId, userInRoom, id);
    }, [userInRoom]);

    useEffect(() => {
        console.warn("Before start", latitude, longitude);
        if (!start) return;
        console.warn("New data", latitude, longitude);
        (async () => {
            setUserInRoom(await inRoom());
        })();
    }, [latitude, longitude]);

    const inRoom = async () => {
        return longitude >= minLong && longitude <= maxLong && latitude >= minLat && latitude <= maxLat;
    };  

    const watchPosition = async () => {

        const options = { 
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 0.001,
            deferredUpdatesInterval: 10,
        }; 

        await Location.watchPositionAsync(options, loc => {  
            console.warn("New location: ", loc);
            setLongitude(loc.coords.longitude.toFixed(4));
            setLatitude(loc.coords.latitude.toFixed(4));
        });  
    };

    return null;
};
