import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Text, Image } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus, faBan, faRecycle, faTrashCan, faUsers, faUser, faCrown, faTimes, faCheck, faHouseChimney, faHouseChimneyUser } from "@fortawesome/free-solid-svg-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client'; 
import UserGeolocation from "./UserGeolocation";
import { useIsFocused } from "@react-navigation/native";
import * as Linking from "expo-linking";
import styles from "../Styles/Styles";

export default function Home({ route, navigation }) {
    
    const {roomsParam} = route?.params ? route.params : {1: null};
    
    const deleteStorage = async () => {
        const keys = await AsyncStorage.getAllKeys();
        await AsyncStorage.multiRemove(keys);
    };

    const [socket, setSocket] = useState(null);
    const [id, setId] = useState(null);
    const [start, setStart] = useState(false);
    const [rooms, setRooms] = useState(route.params?.rooms);
    const [email, setEmail] = useState(null);
    const [username, setUsername] = useState(null);
    const [fullName, setFullName] = useState(null);
    const [logged, setLogged] = useState(route?.params?.loggedParam);
    const [profileImage, setProfileImage] = useState(null);
    const [addButtonHeight, setAddButtonHeight] = useState(null);
    const [accountPhoto, setAccountPhoto] = useState(null);
    const [currRoomsStatus, setCurrRoomsStatus] = useState(null);

    const statusCallback = (roomsStatus) => {
        setCurrRoomsStatus(roomsStatus);
    };

    useEffect(async () => {
        const url = await Linking.getInitialURL();
        let newUrl = "", startIdx, endIdx;
        
        for (startIdx = 0; startIdx < url.length && isNaN(url[startIdx]); startIdx++)
        for (endIdx = url.length - 1; endIdx >= 0 && url[endIdx] !== ":"; endIdx--);
        for (let letter = startIdx; letter < endIdx; letter++)
            newUrl += url[letter];
        
        console.warn("URL: ", newUrl);

        AsyncStorage.getAllKeys().then(data => {
            console.warn("STORAGE: ", data);
            data.forEach(async key => console.warn(key, await AsyncStorage.getItem(key)));
        });

        let newSocket = io(`http://${newUrl}:3000`);
        newSocket.emit('new_connection', "Connected");
        // console.warn("gg");
        
        newSocket.on("get_id", newId => {
            setId(newId);
            // console.warn("salut", newId);
        });

        setSocket(newSocket);
        console.warn("ok");
        
    }, []);

    useEffect(async () => {
        // await deleteStorage();
        if (!socket || !id) return;
        try {

            const loggedLS = await AsyncStorage.getItem("logged") ? JSON.parse(await AsyncStorage.getItem("logged")) : null;
            await loggedLS && setLogged(await loggedLS);
            console.warn("logged: ", await loggedLS);

            const emailLS = await AsyncStorage.getItem("email") && loggedLS ? JSON.parse(await AsyncStorage.getItem("email")) : null;
            const usernameLS = await AsyncStorage.getItem("username") && loggedLS ? JSON.parse(await AsyncStorage.getItem("username")) : null;
            await emailLS && setEmail(await emailLS);
            await usernameLS && setUsername(await usernameLS);
            console.warn("Email & username", await emailLS, await usernameLS);
            
            // emailLS && usernameLS && socket.emit("account_exists", emailLS, usernameLS, async exists => {
            //     console.warn("EXISTS", exists);
            //     if (!exists) await deleteStorage();
            // });  
            
            const areRooms = await loggedLS && await AsyncStorage.getItem("rooms");
            if (areRooms && !roomsParam && await loggedLS) setRooms(JSON.parse(areRooms));
            console.warn(JSON.parse(areRooms) && JSON.parse(areRooms)[0]?.roomId);
            console.warn(await loggedLS);
            await loggedLS && await emailLS && socket.emit("get_rooms", await emailLS, async dbRooms => {
                const newRooms = dbRooms || [];
                console.warn("new rooms: ", newRooms);
                setRooms(newRooms);
                await AsyncStorage.setItem("rooms", JSON.stringify(newRooms));
            });

            const fullNameLS = await loggedLS && await AsyncStorage.getItem("name") ? JSON.parse(await AsyncStorage.getItem("name")) : null;
            await fullNameLS && setFullName(await fullNameLS);

            const profileImageLS = await loggedLS && await AsyncStorage.getItem("profile_image") && JSON.parse(await AsyncStorage.getItem("profile_image"));
            console.warn("Profile image: ", await profileImageLS, await loggedLS);
            setAccountPhoto(await profileImageLS);
            setProfileImage(await profileImageLS);
            console.warn("Socket id: ", id);
            //emailLS && loggedLS && areRooms && socket.emit("update_id", id, emailLS, JSON.parse(areRooms));
            setStart(true);
        } catch (e) {
            console.error("ERROR: ", e);
        }
    }, [socket, id]);

    useEffect(() => {
        console.warn("NEW ROOMS: ", rooms, roomsParam, logged);
        route?.params?.loggedParam && setLogged(route.params.loggedParam);
    }, [rooms]);

    return start && (
        <View style={styles.bigContainer}>
            <ScrollView style={styles.container}>
                <View style={styles.pageContainer}>

                    
                    {logged && (
                        <TouchableOpacity 
                            style={styles.accountContainer}
                            onPress={() => navigation.navigate("Account", {socket: socket, username: username, fullName: fullName, email: email, profileImage: profileImage})}
                        >
                        
                            <FontAwesomeIcon
                                size={25}
                                icon={faUser}
                                color="royalblue"
                            />

                        </TouchableOpacity>
                    )}

                    <View style={styles.titleContent}>
                        <Text style={styles.title}>Rooms</Text>
                    </View>

            
                    {!rooms || rooms.length === 0 ? (
                        <View style={styles.centerText}>
                            <Text style={{fontSize: 36, color: "rgba(255, 255, 255, .4)"}}>No rooms</Text>
                        </View>
                    ) : (
                        <View style={styles.roomContainer}>
                            
                            {currRoomsStatus && [...rooms].map((room, roomIdx) => {
                                return (
                                    <TouchableOpacity style={styles.room} key={roomIdx} onPress={() => navigation.navigate("Users", {id, socket, roomId: room.roomId, email})}>
                                        <Text style={styles.roomTitle}>
                                            {room.roomName}
                                            <FontAwesomeIcon
                                                style={styles.roomIcon}
                                                icon={room.admin ? faCrown : faUser}
                                                size={15}
                                            />
                                        </Text>
                                        <Text style={styles.roomCode}>Room's id: {room.roomId}</Text>
                                        <Text style={styles.roomCreator}>Created by {room.username}</Text>
                                        
                                        <FontAwesomeIcon
                                            style={styles.statusIcon}
                                            icon={currRoomsStatus[roomIdx] ? faCheck : faTimes}
                                            color="#fff"
                                            size={30}
                                        />
                                        <TouchableOpacity 
                                            style={styles.subroomIcon}
                                            onPress={() => navigation.navigate("Subroom", {socket: socket, id: id, roomId: room.roomId, email: email, roomName: room.roomName})}
                                        >
                                            <FontAwesomeIcon
                                                icon={faHouseChimneyUser}
                                                color="royalblue"
                                                size={25}
                                            />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    
                </View>

                {logged && rooms && (
                    <UserGeolocation socket={socket} email={email} rooms={rooms} statusCallback={statusCallback}/>
                )}    
            </ScrollView>
            <View style={styles.addButton}>
                <TouchableOpacity
                    onPress={() => logged && email && username && fullName ? 
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
    );
}