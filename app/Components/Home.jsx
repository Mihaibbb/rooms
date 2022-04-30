import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus, faBan, faRecycle, faTrashCan, faUsers, faUser } from "@fortawesome/free-solid-svg-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client'; 
import UserGeolocation from "./UserGeolocation";


import styles from "../Styles/Styles";

export default function Home({ route, navigation }) {

    const {dbId, rooms} = route.params ? route.params : {ok: null};

    const leaveRoom = async () => {
        const keys = await AsyncStorage.getAllKeys();
        await AsyncStorage.multiRemove(keys);
       
    };

    const [socket, setSocket] = useState(null);
    const [id, setId] = useState(null);
    const [admin, setAdmin] = useState(null);
    const [user, setUser] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [newDbId, setDbId] = useState(null);

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
        const isUser = await AsyncStorage.getItem("user");
        setUser(JSON.parse(isUser));
        console.warn("User", isUser);
        const isRoomId = await AsyncStorage.getItem("roomId");
        setRoomId(isRoomId);
        console.warn("Room Id", isRoomId);
        const isDbId = await AsyncStorage.getItem("db_id");
        console.warn("Db ID new", isDbId);
        setDbId(JSON.parse(isDbId));
    });

    return (
        <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
            <View style={styles.pageContainer}>

                {!rooms ? (
                    <View style={styles.centerText}>
                        <Text style={{fontSize: 36, color: "rgba(0, 0, 0, .3)"}}>No rooms</Text>
                    </View>
                ) : (
                    <View style={styles.roomContainer}>
                        {[...rooms].map(room => {
                            return (
                                <View style={styles.room}>
                                    <Text styles={styles.roomTitle}>{room.title}</Text>
                                    <Text style={styles.roomCode}>{room.code}</Text>
                                    <FontAwesomeIcon
                                        style={styles.roomIcon}
                                        icon={room.type === 'user' ? faUsers : faUser}
                                    />
                                </View>
                            );
                        })}
                    </View>
                )}

                <View style={styles.addButton}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Rooms", {socket, id, admin, user, roomId, newDbId})}
                        
                    >
                        <FontAwesomeIcon 
                            icon={faPlus}
                            size={35}
                            color="rgb(49, 90, 255)"
                        />
                    </TouchableOpacity>
                    
                </View>
            </View>

            {
            (user || dbId !== null) && roomId ? (
                <>
                    <TouchableOpacity
                        style={styles.clearButton}
                        underlayColor="rgb(255, 255, 255)"
                        onPress={async() => await leaveRoom()}
                    >
                        <Text style={styles.clearText}>Leave every room 
                            <FontAwesomeIcon
                                icon={faBan}
                                color="red"
                                size={20}
                                style={styles.icon}
                            />
                        </Text>
                    </TouchableOpacity>
                    <UserGeolocation roomId={roomId} socket={socket} id={newDbId !== null ? newDbId : dbId}/>
                </>
            ) : null
        }    
        </ScrollView>
    );
}