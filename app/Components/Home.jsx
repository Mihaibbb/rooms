import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus, faBan, faRecycle, faTrashCan, faUsers, faUser } from "@fortawesome/free-solid-svg-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client'; 
import UserGeolocation from "./UserGeolocation";

import styles from "../Styles/Styles";

export default function Home({ route, navigation }) {
    
    const {dbId} = route.params ? route.params : {ok: null};
    
    const deleteStorage = async () => {
        const keys = await AsyncStorage.getAllKeys();
        await AsyncStorage.multiRemove(keys);
    };

    const [socket, setSocket] = useState(null);
    const [id, setId] = useState(null);
    const [newDbId, setDbId] = useState(null);
    const [rooms, setRooms] = useState(null);
    const [email, setEmail] = useState(null);
    const [username, setUsername] = useState(null);

    const gotLoggedIn = async () => {
        return await AsyncStorage.getItem("logged");
    };

    useEffect(async () => {
        
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

        try {
            const emailLS = await AsyncStorage.getItem("email") && JSON.parse(await AsyncStorage.getItem("email"));
            const usernameLS = await AsyncStorage.getItem("username") && JSON.parse(await AsyncStorage.getItem("username"));
            setEmail(emailLS);
            setUsername(usernameLS);
            console.warn(emailLS, usernameLS);
            
            emailLS && usernameLS && socket.emit("account_exists", emailLS, usernameLS, async exists => {
                console.warn("EXISTS", exists);
                if (!exists) await deleteStorage();
            });  
            
            if (dbId && emailLS && usernameLS && !await AsyncStorage.getItem("db_id")) await AsyncStorage.setItem("db_id", JSON.stringify(dbId));
            const isDbId = await AsyncStorage.getItem("db_id");
            console.warn("Db ID new", isDbId);
            setDbId(JSON.parse(isDbId));
            const areRooms = await AsyncStorage.getItem("rooms");
            if (areRooms !== null) setRooms(JSON.parse(areRooms));
            console.warn(JSON.parse(areRooms));

            await gotLoggedIn() && socket.emit("get_rooms", email, dbRooms => {
                const newRooms = dbRooms ? JSON.parse(dbRooms) : [];
                setRooms(newRooms);
            });

        } catch (e) {
            console.warn("ERROR: ", e);
        }
    });

    useEffect(() => console.warn("NEW ROOMS: ", rooms), [rooms]);

    return (
        <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
            <View style={styles.pageContainer}>

                {!rooms ? (
                    <View style={styles.centerText}>
                        <Text style={{fontSize: 36, color: "rgba(255, 255, 255, .4)"}}>No rooms</Text>
                    </View>
                ) : (
                    <View style={styles.roomContainer}>
                        {[...rooms].map((room, roomIdx) => {
                            return (
                                <TouchableOpacity style={styles.room} key={roomIdx}>
                                    <Text styles={styles.roomTitle}>{room.roomName}</Text>
                                    <Text style={styles.roomCode}>{room.roomId}</Text>
                                    <FontAwesomeIcon
                                        style={styles.roomIcon}
                                        icon={room.admin ? faUser : faUsers}
                                    />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                <View style={styles.addButton}>
                    <TouchableOpacity
                        onPress={async () => await gotLoggedIn() ? 
                            navigation.navigate("AddRoom", {socket, id, newDbId}) : 
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

            {
            (dbId !== null) ? (
                <UserGeolocation socket={socket} id={newDbId !== null ? newDbId : dbId}/>
            ) : null
        }    
        </ScrollView>
    );
}