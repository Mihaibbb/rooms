import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Platform, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager'; 
import styles from "../Styles/GeolocationStyles";     

export default function Home({ route, navigation }) {

    const {socket, id, email, roomId, roomName, subroomId, subroomName} = route.params;

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [locationText, setLocationText] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [corners, setCorners] = useState([]);

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
        setStart(true);

        const geolocationData = `${newMinLat} ${newMaxLat} ${newMinLong} ${newMaxLong}`;
        console.warn("This is the email: ", email);
        console.warn("This is the socket id: ", id);
        console.warn("HERE");
        socket.emit("get_rooms", email, async rooms => {
            const newRooms = rooms || [];
          
            let foundIdx;
            newRooms.forEach((room, idx) => room.roomId === roomId ? foundIdx = idx : null);
            newRooms[foundIdx].subRooms.push({
                roomId: roomId,
                roomName: roomName,
                userStatus: !inRoom ? 0 : inRoom,
                geolocation: geolocationData,
            });

            try {
                await AsyncStorage.setItem("rooms", JSON.stringify(newRooms));
            } catch(e) {
                console.error(e);
            }
            socket.emit("update_rooms", email, JSON.stringify(newRooms));
            setTimeout(() => navigation.navigate("Rooms"), 750);
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
                    
                    <Text style={styles.corners}>{inRoom ? "You are in the room!" : start ? "You are not in the room!" : ""}</Text>
                </View>
            </View>
        </View>
    );
};