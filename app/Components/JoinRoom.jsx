import { Platform } from "expo-modules-core";
import React, { useState, useEffect } from "react";
import { View, Button, Text, TextInput, Keyboard, TouchableWithoutFeedback, TouchableOpacity, TouchableHighlight } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Socket } from "socket.io-client";
import styles from "../Styles/CreateStyles";

const ROOM_LENGTH = 6;

export default function JoinRoom({ route, navigation }) {

    const {socket, id, email, username, fullName} = route.params;
    console.warn(id);

    const [roomIdAccount, setRoomIdAccount] = useState(null);
    const [myErrs, setErrors] = useState([]);

    const [isKBVisible, setKBVisible] = useState(false);

    // useEffect(async () => {
    //     try {
    //         const keys = await AsyncStorage.getAllKeys();
    //         keys.forEach(async key => {
    //             const element = await AsyncStorage.getItem(key);
    //             console.warn(element);
    //         });
    //     } catch(e) {
    //         console.warn("error 1", e);
    //     }    
       
    // }, []);
    // console.warn(socket);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKBVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKBVisible(false));
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const _storeData = async (key, value) => {
        console.warn('work', value);
        try {
            const keys = Object.keys(value);
            keys.forEach(async (keyName) => {
                await AsyncStorage.setItem(keyName, JSON.stringify(value[keyName]));
            });
            
        } catch(e) {
            console.warn("error", e);
        }
    };

    const joinCurrRoom = () => {
        let errors = "";
        if (roomIdAccount.length !== ROOM_LENGTH) errors += "Room doesn't have a valid form.";

        socket.emit("room_exists", roomIdAccount, response => {
            if (!response) errors += "Room doesn't exist.";
 
            if (errors.length > 0) {
                const errs = errors.split(".");
                setErrors(errs);
                return;
            }

            const roomName = response["room_name"];
            
            console.warn("HERE 13");
            socket.emit("get_user_data", email, data => {
                console.warn(data, data.rooms);
                const sameRoom = data.rooms && data.rooms.some(room => room.roomId === roomIdAccount);
                
                if (sameRoom === true) {
                    errors += "You are already in the room!.";
                    const errs = errors.split(".");
                    setErrors(errs);
                    return;
                } 

                socket.emit("join_room", roomIdAccount, 0, id, email, username, fullName);

                socket.emit("get_room_data", roomIdAccount, rows => {
                    const dbGeolocation = rows[0]["geolocation"];
                    
                    socket.emit("room_dbId", roomIdAccount, username, foundId => {
                        if (!foundId) return;
                        socket.emit("get_subrooms", roomIdAccount, rows[0]["username"], async subRooms => {
                            try {
                                const newRooms = await AsyncStorage.getItem("rooms") ? JSON.parse(await AsyncStorage.getItem("rooms")) : [];
                                if (!newRooms) newRooms = [];
                                console.warn("ROOMS: ", newRooms);
                                newRooms.push({
                                    roomId: roomIdAccount,
                                    roomName: roomName,
                                    admin: false,
                                    userStatus: 0,
                                    geolocation: dbGeolocation,
                                    username: rows[0]["username"],
                                    name: rows[0]["name"],
                                    id: foundId,
                                    subRooms: subRooms
                                });
        
                                await AsyncStorage.setItem("rooms", JSON.stringify(newRooms));
                                socket.emit("update_rooms", email, JSON.stringify(newRooms));
                                setTimeout(() => navigation.navigate("Rooms", {rooms: newRooms}), 500);
                            } catch(e) {
                                console.error(e);
                            }
                        });
                    });
                });
                
            });
        });
    };
    
    return (
        <TouchableWithoutFeedback onPress={() => isKBVisible ? Keyboard.dismiss() : null}>
            <View style={styles.container}>

                    
                <TextInput
                    style={styles.input}
                    onChangeText={setRoomIdAccount}
                    value={roomIdAccount}
                    placeholder="Room's id..."
                    keyboardAppearance="dark"
                    placeholderTextColor="rgba(255, 255, 255, .6)"

                />
    
                <View style={styles.idContainer}>
                    <Text style={[styles.bottomText, styles.whiteText]}>Your id is: 
                        <Text style={styles.idText}> {id}</Text>
                    </Text>
                </View>
                   
                { Platform.OS === 'ios' ? 
                    (
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            underlayColor="#fff"
                            onPress={async () => joinCurrRoom()}
                        >
                            <Text style={styles.whiteText}>Join room</Text>
                        </TouchableOpacity>
                    ) : Platform.OS === 'android' ? 
                    (
                        <View style={{width: "100%", maxWidth: 250, marginTop: 35, height: 50}}>
                            <Button
                                title="Join room"
                                backgroundColor="#841584"
                                
                                onPress={async () => joinCurrRoom()}
                            />
                        </View>
                    ) : null
                }
                <View style={styles.errorsContainer}>
                    {myErrs.map((err, idx) => (
                        <Text style={styles.error} key={idx}>{err}</Text>
                    ))}
                </View>
                
            </View>
        </TouchableWithoutFeedback>
    );
};