import { Platform } from "expo-modules-core";
import React, { useState, useEffect } from "react";
import { View, Button, Text, TextInput, Keyboard, TouchableWithoutFeedback, TouchableOpacity, TouchableHighlight } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "../Styles/CreateStyles";

export default function CreateRoom({ route, navigation }) {
    const {socket, id, email, username, fullName} = route.params;

    console.log(id);

    const [roomName, changeRoomName] = useState(null);

    const [isKBVisible, setKBVisible] = useState(false);
    const [roomId, setRoomId] = useState(null);

    useEffect(async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            keys.forEach(async key => {
                const element = await AsyncStorage.getItem(key);
                console.log(key, element);
            });
        } catch(e) {
            console.log("error 1", e);
        }    
       
    }, []);
    // console.log(socket);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKBVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKBVisible(false));
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const _storeData = async (key, value) => {
        console.log('work', value);
        try {
            const keys = Object.keys(value);
            keys.forEach(async (keyName) => {
                await AsyncStorage.setItem(keyName, value[keyName]);
            });
        } catch (e) {
            console.log("Error from here", e);
        };

        try {
            const item = await AsyncStorage.getItem(key);
            console.log("Item", item);
        } catch(e) {
            console.log("error", e);
        }

    };

    useEffect(() => {
        let newRoomId = Math.random().toString(36).substring(2, 8);
        while (roomExists(newRoomId)) {
            newRoomId = Math.random().toString(36).substring(2, 8);
        }
        setRoomId(newRoomId);
    }, []);

    const roomExists = (id) => {
        socket.emit("room_exists", id, res => {
            if (!res) return false;
            return true;
        });
    };

    const submitCreate = async () => {
        if (roomName.length < 4) return;
        console.log("email", email);
        if (!email) return;
        navigation.navigate('Geolocation', {...route.params, roomId, roomName, username, fullName});
    };
    
    return roomId && (
        <TouchableWithoutFeedback onPress={() => isKBVisible ? Keyboard.dismiss() : null}>
            <View style={styles.container}>
                

                <Text style={styles.normText}>Your new room id is: 
                    <Text style={styles.idText}> {roomId}</Text>
                </Text>

                <TextInput
                    style={styles.input}
                    onChangeText={changeRoomName}
                    value={roomName}
                    placeholder="Your room's name..."
                    keyboardAppearance="dark"
                    placeholderTextColor="rgba(255, 255, 255, .6)"
                />


                <View style={styles.idContainer}>
                    <Text style={(styles.bottomText, styles.whiteText)}>Your id is: 
                        <Text style={styles.idText}> {id}</Text>
                    </Text>
                </View>

                { Platform.OS === 'ios' ? 
                    (
                        <TouchableOpacity
                            style={styles.buttonContainer}
                            underlayColor="#fff"
                            onPress={() => submitCreate()}
                        >
                            <Text style={styles.whiteText}>Next step</Text>
                        </TouchableOpacity>
                    ) : Platform.OS === 'android' ? 
                    (
                        <View style={{width: "100%", maxWidth: 250, marginTop: 35, height: 50}}>
                            <Button
                                title="Next step"
                                backgroundColor="#841584"
                                accessibilityLabel="Learn more about this purple button"
                                onPress={() => submitCreate()}
                            />
                        </View>
                    ) : null
                }
               
               
            </View>
        </TouchableWithoutFeedback>
    );
};