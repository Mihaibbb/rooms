import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Text, Image } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus, faBan, faRecycle, faTrashCan, faUsers, faUser, faCrown } from "@fortawesome/free-solid-svg-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client'; 
import UserGeolocation from "./UserGeolocation";
import { useIsFocused } from "@react-navigation/native";
import * as Network from "expo-network";
import * as Linking from "expo-linking";
import styles from "../Styles/Styles";

export default function Home({ route, navigation }) {
    
    const {roomsParam} = route?.params ? route.params : {1: null};
    const isFocused = useIsFocused();

    useEffect(async () => {
        
    });

    // useEffect(() => {
    //     const manager = new BleManager();
    //     const subscription = manager.onStateChange((state) => {
    //         console.log(state);
    //     }, true); 
    // });



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
    const [logged, setLogged] = useState(route?.params?.loggedParam);
    const [profileImage, setProfileImage] = useState(null);
    const [addButtonHeight, setAddButtonHeight] = useState(null);
    const [accountPhoto, setAccountPhoto] = useState(null);
    
    const gotLoggedIn = async () => {
        return await AsyncStorage.getItem("logged");
    };

    useEffect(async () => {
        const url = await Linking.getInitialURL();
        let newUrl = "", startIdx, endIdx;
        
        for (startIdx = 0; startIdx < url.length && isNaN(url[startIdx]); startIdx++)
        for (endIdx = url.length - 1; endIdx >= 0 && url[endIdx] !== ":"; endIdx--);
        for (let letter = startIdx; letter < endIdx; letter++)
            newUrl += url[letter];
        
        console.warn("URL: ", newUrl);
        console.warn("Email", email);
        
        let isMounted = true;
        AsyncStorage.getAllKeys().then(data => {
            if (isMounted) console.warn("STORAGE: ", data);
        })
        let newSocket = io(`http://${newUrl}:3000`);
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
        // await deleteStorage();
        if (!socket) return;
        try {

            const loggedLS = await AsyncStorage.getItem("logged") ? JSON.parse(await AsyncStorage.getItem("logged")) : null;
            loggedLS && setLogged(loggedLS);
            console.warn("logged: ", loggedLS);

            const emailLS = await AsyncStorage.getItem("email") && loggedLS ? JSON.parse(await AsyncStorage.getItem("email")) : null;
            const usernameLS = await AsyncStorage.getItem("username") && loggedLS ? JSON.parse(await AsyncStorage.getItem("username")) : null;
            emailLS && setEmail(emailLS);
            usernameLS && setUsername(usernameLS);
            console.warn("Email & username", emailLS, usernameLS);
            
            emailLS && usernameLS && socket.emit("account_exists", emailLS, usernameLS, async exists => {
                console.warn("EXISTS", exists);
                if (!exists) await deleteStorage();
            });  
            
            const areRooms = loggedLS && await AsyncStorage.getItem("rooms");
            if (areRooms && !roomsParam && loggedLS) setRooms(JSON.parse(areRooms));
            console.warn(JSON.parse(areRooms) && JSON.parse(areRooms)[0]?.roomId);
            console.warn(loggedLS);
            loggedLS && emailLS && socket.emit("get_rooms", emailLS, async dbRooms => {
                const newRooms = dbRooms || [];
                console.warn("new rooms: ", newRooms);
                setRooms(newRooms);
                await AsyncStorage.setItem("rooms", JSON.stringify(newRooms));
            });

            const fullNameLS = loggedLS && await AsyncStorage.getItem("name") ? JSON.parse(await AsyncStorage.getItem("name")) : null;
            fullNameLS && setFullName(fullNameLS);

            const profileImageLS = loggedLS && await AsyncStorage.getItem("profile_image") && JSON.parse(await AsyncStorage.getItem("profile_image"));
            console.warn("Profile image: ", profileImageLS, loggedLS);
            setAccountPhoto(profileImageLS);
            setProfileImage(profileImageLS);

        } catch (e) {
            console.warn("ERROR: ", e);
        }
    }, [socket, isFocused]);


    useEffect(() => {
        console.warn("NEW ROOMS: ", rooms, roomsParam, logged);
        route?.params?.loggedParam && setLogged(route.params.loggedParam);
    }, [rooms]);

    return (
        <>
            <ScrollView style={styles.container}>
                <View style={styles.pageContainer}>

                    {logged && (
                        <TouchableOpacity 
                            style={styles.accountContainer}
                            onPress={() => navigation.navigate("Account", {socket: socket, username: username, fullName: fullName, email: email, profileImage: profileImage})}
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
                                            icon={room.admin ? faCrown : faUser}
                                            size={35}
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    
                </View>

                {logged && (
                    <UserGeolocation socket={socket} email={email} rooms={rooms} />
                )}    
            </ScrollView>
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
        </>
    );
}