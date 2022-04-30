import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client'; 
import styles from "../Styles/HomeStyles";
import UserGeolocation from "./UserGeolocation";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faBan, faRecycle, faTrashCan } from "@fortawesome/free-solid-svg-icons";

export default function Rooms({ route, navigation }) {

    const dbId = route.params?.dbId;
    console.warn("DB ID", dbId, route.params?.id);
    const [socket, setSocket] = useState(null);
    const [id, setId] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [newDbId, setDbId] = useState(null);
    const [createdRoom, setCreatedRoom] = useState(route.params?.createdRoom);
    const leaveRoom = async () => {
        setTimeout(async () => {
            const keys = await AsyncStorage.getAllKeys();
            await AsyncStorage.multiRemove(keys);
            console.warn(roomId, dbId, admin);
            socket.emit('leave_room', roomId, dbId, admin);
            setAdmin(false);
            setCreatedRoom(false);
        }, 0);
    };

    const leaveRoom2 = async() => {
        setTimeout(async () => {
            const keys = await AsyncStorage.getAllKeys();
            await AsyncStorage.multiRemove(keys);
            console.warn(roomId, dbId, admin);
            setAdmin(false);
            setCreatedRoom(false);
        }, 0);
    };

    useEffect(() => {
        
        let newSocket = io("http://192.168.1.14:3000");
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
        if (dbId) await AsyncStorage.setItem("db_id", JSON.stringify(dbId));
        const isAdmin = await AsyncStorage.getItem("admin");
        setAdmin(JSON.parse(isAdmin));
        console.warn("Admin", isAdmin);
        const isUser = await AsyncStorage.getItem("user");
        setUser(JSON.parse(isUser));
        console.warn("User", isUser);
        const isRoomId = await AsyncStorage.getItem("roomId");
        setRoomId(isRoomId);
        console.warn("Room Id", isRoomId);
        const isDbId = await AsyncStorage.getItem("db_id");
        console.warn("Db ID new", isDbId);
        setDbId(JSON.parse(isDbId));

        const newUsername = await AsyncStorage.getItem("username_db");
        if (newUsername !== null) setUsername(newUsername);
        else socket.emit("get_username", isRoomId, !admin ? parseInt(isDbId) : 1, async dbUsername => {
            setUsername(dbUsername);
            await AsyncStorage.setItem("username_db", dbUsername);
        });


    }, []);

    const createRoom = () => {
        navigation.navigate('CreateRoom', {id: id, socket: socket});
    };

    const joinRoom = () => {
        console.warn(socket.id);
        navigation.navigate('JoinRoom', {id: id, socket: socket});
    };

    const checkUsers = () => {
        navigation.navigate('Users', {id: id, socket: socket});
    };  

    return socket && (
        <View style={styles.container}>
            {
                !admin && !createdRoom && !user ? (
                    <>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            underlayColor="rgb(255, 255, 255)"
                            onPress={() => createRoom()}
                        >
                            <Text style={styles.text}>Create new room</Text>
                            
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            underlayColor="rgb(255, 255, 255)"
                            onPress={() => joinRoom()}
                        >
                            <Text style={styles.text}>Join a room</Text>
                        </TouchableOpacity>
                    </>
                ) : !user ?  (
                    <>
                         <TouchableOpacity
                            style={styles.buttonContainer}
                            underlayColor="rgb(255, 255, 255)"
                            onPress={() => checkUsers()}
                        >
                            <Text style={styles.text}>Check users status</Text>
                            
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text>Username: {username}</Text>
                    </>
                )
            }

            {
                (user || dbId !== null  || createdRoom) && roomId ? (
                    <>
                        <TouchableOpacity
                            style={styles.clearButton}
                            underlayColor="rgb(255, 255, 255)"
                            onPress={async() => await leaveRoom()}
                        >
                            <Text style={styles.clearText}>
                                {admin ? "Delete room" : "Leave room"}
                                <FontAwesomeIcon
                                    icon={faBan}
                                    color="red"
                                    size={20}
                                    style={styles.icon}
                                />
                            </Text>
                        </TouchableOpacity>
                        <UserGeolocation roomId={roomId} socket={socket} id={admin ? 1 : newDbId !== null ? newDbId : dbId}/>
                    </>
                ) : null
            }    

        </View>
    );
};