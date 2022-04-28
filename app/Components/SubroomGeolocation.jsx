import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Platform, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager'; 
import styles from "../Styles/GeolocationStyles";     

export default function Home({ route, navigation }) {

    const {socket, id, email, roomId, roomName, subroomId, subroomName, roomGeolocation} = route.params;

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [locationText, setLocationText] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [corners, setCorners] = useState([]);
    const [error, setError] = useState(false);

    const [minLat, setMinLat] = useState(null);
    const [minLong, setMinLong] = useState(null);
    const [maxLat, setMaxLat] = useState(null);
    const [maxLong, setMaxLong] = useState(null);

    const [inRoom, setInRoom] = useState(null);
    const [start, setStart] = useState(false);

    TaskManager.defineTask('trackLocation', ({ data: { locations }, error }) => {
        if (error) return;   
        console.warn('Received new locations', locations);
    });

    const checkInRoom = (geolocationData) => {
        return geolocationData[0] >= roomGeolocation[0] && geolocationData[1] <= roomGeolocation[1] && geolocationData[2] >= roomGeolocation[2] && geolocationData[3] <= roomGeolocation[3];
    };

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

    // useEffect(() => {
    //     if (inRoom === null) return;
    //     socket.emit("change_status", roomId, inRoom);
    // }, [inRoom]); 

    useEffect(() => {
        if (!start) return;
    }, [latitude, longitude]);

    useEffect(async () => {
        if (!start) return;

        
    }, [start]);

    const watchPosition = async () => {
        await Location.watchPositionAsync({ 
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 0.0001,
            deferredUpdatesInterval: 50,
            
        }, loc => {  
            setLongitude(loc.coords.longitude.toFixed(4));
            setLatitude(loc.coords.latitude.toFixed(4));
        });
        
    };

    const setNewCorner = () => {
        if (corners.length === 4) return;
        
        let newCorners = [...corners, {
            latitude: latitude,
            longitude: longitude
        }];

        setCorners(newCorners);
        setError(false);

        if (newCorners.length === 4) getRoomCoordinates();
    };

    const getRoomCoordinates = () => {
        let newMinLat = Number.POSITIVE_INFINITY, newMinLong = Number.POSITIVE_INFINITY;
        let newMaxLat = Number.NEGATIVE_INFINITY, newMaxLong = Number.NEGATIVE_INFINITY;
        corners.forEach(corner => {
            newMinLat = Math.min(newMinLat, corner.latitude);
            newMaxLat = Math.max(newMaxLat, corner.latitude);
            newMinLong = Math.min(newMinLong, corner.longitude);
            newMaxLong = Math.max(newMaxLong, corner.longitude);
        });
        
        setMinLat(newMinLat);
        setMaxLat(newMaxLat);
        setMinLong(newMinLong);
        setMaxLong(newMaxLong);
        

        const geolocationData = `${newMinLat} ${newMaxLat} ${newMinLong} ${newMaxLong}`;
        if (!checkInRoom(geolocationData.split(" "))) {
            setCorners([]);
            setError(true);
            return;
        }
        
        setStart(true);
        console.warn("This is the email: ", email);
        console.warn("This is the socket id: ", id);
        console.warn("HERE");
        socket.emit("get_rooms", email, async rooms => {
            try {
                const newRooms = rooms || [];
                if (newRooms.length === 0) return;

                let foundIdx;
                newRooms.forEach((room, idx) => room.roomId === roomId ? foundIdx = idx : null);

                if (!newRooms[foundIdx].subRooms) newRooms[foundIdx].subRooms = [];

                newRooms[foundIdx].subRooms.push({
                    roomId: subroomId,
                    roomName: subroomName,
                    userStatus: !inRoom ? 0 : inRoom,
                    geolocation: geolocationData,
                });

                await AsyncStorage.setItem("rooms", JSON.stringify(newRooms));
                socket.emit("update_rooms", email, JSON.stringify(newRooms));
                setTimeout(() => navigation.navigate("Rooms"), 750);
            } catch(e) {
                console.error(e);
            }
        });        
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Subroom Geolocation</Text>
            <View style={styles.content}>
                <View style={styles.cornerContainer}>
                    <Text style={styles.corners}>{!start ? `Corners set: ${corners.length}` : ""}</Text>
                </View>
                <View style={styles.coordsContainer}>
                    {longitude && (
                        <Text style={styles.coords}>Longitude: {longitude}</Text>
                    )}
                    {latitude && (
                        <Text style={styles.coords}>Latitude: {latitude}</Text>
                    )}
                </View>

                {longitude && latitude && 
                    <TouchableOpacity
                        style={styles.buttonContainer}
                        underlayColor="rgb(255, 255, 255)"
                        onPress={() => setNewCorner()}
                    >
                        <Text style={styles.buttonText}>Set corners of the room</Text>
                    </TouchableOpacity>
                }  
                <View style={styles.results}>    
                    {error && <Text style={styles.corners}>The subroom is not into the room!</Text>}
                    {/* <Text style={styles.corners}>{inRoom ? "You are in the room!" : start ? "You are not in the room!" : ""}</Text> */}
                </View>
            </View>
        </View>
    );
};