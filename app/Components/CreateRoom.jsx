import { Platform } from "expo-modules-core";
import React, { useState, useEffect } from "react";
import { View, Button, Text, TextInput, Keyboard, TouchableWithoutFeedback, TouchableOpacity, TouchableHighlight } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "../Styles/CreateStyles";

export default function CreateRoom({ route, navigation }) {

    const { id, socket } = route.params;
    console.warn(id);

    const [roomName, changeRoomName] = useState(null);
    const [adminName, setAdminName] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);

    const [isKBVisible, setKBVisible] = useState(false);
    const [roomId, setRoomId] = useState(null);

    useEffect(async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            keys.forEach(async key => {
                const element = await AsyncStorage.getItem(key);
                console.warn(element);
            });
        } catch(e) {
            console.warn("error 1", e);
        }    
       
    }, []);
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
                await AsyncStorage.setItem(keyName, value[keyName]);
            });
        } catch (e) {
            console.warn("Error from here", e);
        };

        try {
            const item = await AsyncStorage.getItem(key);
            console.log("Item", item);
        } catch(e) {
            console.warn("error", e);
        }

    };

    useEffect(() => {
        const newRoomId = Math.random().toString(36).substring(2, 8);
        setRoomId(newRoomId);
    }, []);

    const submitCreate = async () => {
        if (roomName.length < 4 || adminName.length < 3) return;
        
        console.warn(roomName, adminName);
        const room = {
            roomId: roomId, 
            roomName: roomName,
            admin: adminName,
            id: id
        };
        
        await _storeData("room", room);
        
        navigation.navigate('Geolocation', {...route.params, roomId, roomName, adminName, email, password});
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

                <TextInput
                    style={styles.input}
                    onChangeText={setAdminName}
                    value={adminName}
                    placeholder="Your full name..."
                    keyboardAppearance="dark"
                    placeholderTextColor="rgba(255, 255, 255, .6)"
                />

                <TextInput
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                    placeholder="Your email...."
                    keyboardAppearance="dark"
                    placeholderTextColor="rgba(255, 255, 255, .6)"
                />

                <TextInput
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    placeholder="Your password...."
                    keyboardAppearance="dark"
                    secureTextEntry={true}
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