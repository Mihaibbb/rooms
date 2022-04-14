import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus, faBan, faRecycle, faTrashCan, faUsers, faUser } from "@fortawesome/free-solid-svg-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client'; 
import UserGeolocation from "./UserGeolocation";
import { useIsFocused } from "@react-navigation/native";

import styles from "../Styles/Styles";

export default function Home({ route, navigation }) {
    
    const {roomsParam} = route?.params ? route.params : {1: null, 2: null, 3: null};
    const isFocused = useIsFocused();

    const deleteStorage = async () => {
        const keys = await AsyncStorage.getAllKeys();
        await AsyncStorage.multiRemove(keys);
    };

    const [socket, setSocket] = useState(null);
    const [id, setId] = useState(null);
    const [rooms, setRooms] = useState(null);
    const [email, setEmail] = useState(null);
    const [username, setUsername] = useState(null);
    const [fullName, setFullName] = useState(null);
    const [logged, setLogged] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [addButtonHeight, setAddButtonHeight] = useState(null);

    const gotLoggedIn = async () => {
        return await AsyncStorage.getItem("logged");
    };

    useEffect(async () => {
        console.warn("Email", email);
        let isMounted = true;
        AsyncStorage.getAllKeys().then(data => {
            if (isMounted) console.warn("STORAGE: ", data);
        })
        let newSocket = io("http://192.168.1.14:3000");
        newSocket.emit('new_connection', "Connected");
        // console.warn("gg");
        
        newSocket.on("get_id", newId => {
            setId(newId);
            // console.warn("salut", newId);
        });

        setSocket(newSocket);
        console.warn("ok");
        
        return () => {
            isMounted = false;
        }
        
    }, [isFocused]);

    useEffect(async () => {
        //await deleteStorage();
        if (!socket) return;
        try {
            const emailLS = await AsyncStorage.getItem("email") ? JSON.parse(await AsyncStorage.getItem("email")) : null;
            const usernameLS = await AsyncStorage.getItem("username") ? JSON.parse(await AsyncStorage.getItem("username")) : null;
            emailLS && setEmail(emailLS);
            usernameLS && setUsername(usernameLS);
            console.warn("Email & username", emailLS, usernameLS);
            
            emailLS && usernameLS && socket.emit("account_exists", emailLS, usernameLS, async exists => {
                console.warn("EXISTS", exists);
                if (!exists) await deleteStorage();
            });  
            
            
            const areRooms = await AsyncStorage.getItem("rooms");
            if (areRooms !== null && !roomsParam) setRooms(JSON.parse(areRooms));
            console.warn(JSON.parse(areRooms) && JSON.parse(areRooms)[0]?.roomId);

            !areRooms && await gotLoggedIn() && socket.emit("get_rooms", emailLS, dbRooms => {
                const newRooms = dbRooms ? JSON.parse(dbRooms) : [];
                console.warn("new rooms: ", newRooms);
                setRooms(newRooms);
            });

            const loggedLS = await AsyncStorage.getItem("logged") ? JSON.parse(await AsyncStorage.getItem("logged")) : null;
            loggedLS !== null && setLogged(loggedLS);

            const fullNameLS = await AsyncStorage.getItem("name") ? JSON.parse(await AsyncStorage.getItem("name")) : null;
            fullNameLS && setFullName(fullNameLS);
        } catch (e) {
            console.warn("ERROR: ", e);
        }
    }, [socket, isFocused]);


    useEffect(() => console.warn("NEW ROOMS: ", rooms), [isFocused, rooms]);

    return (
        <ScrollView 
            style={styles.container} 
        >
            <View 
                style={styles.pageContainer}
            >

                {logged && (
                    <TouchableOpacity 
                        style={styles.accountContainer}
                        onPress={() => navigation.navigate("Account", {username: username, fullName: fullName, email: email, profileImage: profileImage})}
                    >
                        <FontAwesomeIcon
                            size={20}
                            icon={faUser}
                            color="royalblue"
                        />
                    </TouchableOpacity>
                )}
        
                {!rooms || rooms.length === 0 ? (
                    <View style={styles.centerText}>
                        <Text style={{fontSize: 36, color: "rgba(255, 255, 255, .4)"}}>No rooms</Text>
                    </View>
                ) : (
                    <View style={styles.roomContainer}>
                        
                        {[...rooms].map((room, roomIdx) => {
                            return (
                                <TouchableOpacity style={styles.room} key={roomIdx} onPress={() => navigation.navigate("Users", {id, socket, roomId: room.roomId, email})}>
                                    <Text style={styles.roomTitle}>{room.roomName}</Text>
                                    <Text style={styles.roomCode}>Room's id: {room.roomId}</Text>
                                    <Text style={styles.roomCreator}>Created by {room.username}</Text>
                                    <FontAwesomeIcon
                                        style={styles.roomIcon}
                                        icon={room.admin ? faUser : faUsers}
                                        size={35}
                                    />
                                </TouchableOpacity>
                               );
                        })}
                    </View>
                )}

                <View style={styles.addButton}>
                    <TouchableOpacity
                        onPress={async () => await gotLoggedIn() && email && username && fullName ? 
                            navigation.navigate("AddRoom", {socket: socket, id: id, email: email, username: username, fullName : fullName}) : 
                            navigation.navigate("Sign", {socket, id})
                        }
                    >
                        <FontAwesomeIcon 
                            icon={faPlus}
                            size={35}
                            color="rgb(49, 90, 255)"
                        />
                    </TouchableOpacity>
                    
                </View>
            </View>

            {logged && (
                <UserGeolocation socket={socket} email={email} rooms={rooms} />
            )}    
        </ScrollView>
    );
}