import { Platform } from "expo-modules-core";
import React, { useState, useEffect } from "react";
import { View, Button, Text, TextInput, Keyboard, TouchableWithoutFeedback, TouchableOpacity, TouchableHighlight } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Socket } from "socket.io-client";
import styles from "../Styles/CreateStyles";

const ROOM_LENGTH = 6;

export default function JoinRoom({ route, navigation }) {

    const { id, socket } = route.params;
    console.warn(id);

    const [roomId, changeRoomId] = useState(null);
    const [username, setUsername] = useState(null);
    const [dbId, setDatabaseId] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [account, hasAccount] = useState(false);
    const [emailAccount, setEmailAccount] = useState(null);
    const [passwordAccount, setPasswordAccount] = useState(null);
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

    const submitJoin = async () => {
        let errors = "";
        if (roomId.length != ROOM_LENGTH) {
            errors += "Room has the wrong length.";
        }
        if (username.length < 3) {
            errors += "Username must have at least 3 characters.";
        }

        if (password.length < 8) {
            errors += "Password must have at least 8 characters.";
        }

        let countsAt = 0;
        const emailChars = email.split("");
        emailChars.forEach(character => character === '@' ? countsAt++ : null);
        if (countsAt != 1) {
            errors += "Email doesn't have a valid form.";
        };

        socket.emit("room_exists", roomId, (response) => {
            if (!response) {
                errors += "Room doesn't exist.";
                let newErrs = errors.split(".");
                setErrors(newErrs);
                return;
            }
            socket.emit("same_account", email, password, roomId, async (sameAcc) => {
                if (sameAcc) errors += "The account has already been registered.";
                
                let newErrs = errors.split(".");
                setErrors(newErrs);
                if (errors.length > 0) return;

                const room = {
                    roomId: roomId,
                    username: username,
                    id: id
                };
                
                await _storeData("room", room);
                await AsyncStorage.setItem("user", JSON.stringify(1));
                await AsyncStorage.setItem("roomId", roomId);
                
                socket.emit("join_room", roomId, username, 0, id, email, password);
                let newDbId;
                console.warn("HERE");

                socket.on("db_id", serverId => {
                    newDbId = serverId;
                    console.warn("In socket dbId", serverId);

                    setTimeout(() => navigation.navigate('Home', {dbId: newDbId}), 1500);
                });
            });
            
    
        });
        // await AsyncStorage.setItem("dbId", newDbId);
        console.warn(newDbId);  

    };

    const submitJoinAccount = async () => {
        let errors = "";
        if (roomIdAccount.length != ROOM_LENGTH) errors += "Room has the wrong length.";
        if (passwordAccount.length < 8) errors += "Password must have at least 8 characters.";

        let countsAt = 0;
        const emailChars = emailAccount.split("");
        emailChars.forEach(character => character === '@' ? countsAt++ : null);
        if (countsAt != 1) errors += "Email doesn't have a valid form.";
        console.warn("EASY");
        
        socket.emit("room_exists", roomIdAccount, (response) => {
            if (!response) {
                errors += "Room doesn't exist.";
                let newErrors = errors.split(".");
                setErrors(newErrors);
                return;
            }

            
            
            socket.emit("found_account", emailAccount, passwordAccount, roomIdAccount, async (foundDbId) => {
                console.warn("HERE");
                if (!foundDbId) errors += "The email and/or password are incorrect.";
               
                let newErrs = errors.split(".");
                setErrors(newErrs);
                if (errors.length > 0) return;
                
                const room = {
                    roomId: roomIdAccount,
                    username: foundDbId.username,
                    id: id,
                    dbId: foundDbId.id
                };

                
                console.warn("ID: ", foundDbId.id);
                console.warn("FINALLY 2");
              
                await _storeData("room", room);
                await AsyncStorage.setItem("user", JSON.stringify(1));
                await AsyncStorage.setItem("roomId", roomIdAccount);
                
                console.warn("In socket dbId", foundDbId.id);

                setTimeout(() => navigation.navigate('Home', {dbId: foundDbId.id}), 1500);
            });
        });
    };
    
    return (
        <TouchableWithoutFeedback onPress={() => isKBVisible ? Keyboard.dismiss() : null}>
            <View style={styles.container}>

                {/* <Text style={styles.normText}>Your new room id is: 
                    <Text style={styles.idText}> {roomId}</Text>
                </Text> */}

                <View style={styles.account}>
                    <TouchableOpacity 
                        style={[styles.accountContainer, {flex: 1.2, borderRightWidth: 2, borderRightColor: "rgb(33,150,243)"}]}
                        onPress={() => hasAccount(false)}
                    >
                        <Text style={[styles.accountText, !account ? {color: "royalblue"} : null]}>Don't have an account</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.accountContainer, {flex: 1, borderLeftWidth: 2, borderLeftColor: 'rgb(33,150,243)'}]}
                        onPress={() => hasAccount(true)}
                    >
                        <Text style={[styles.accountText, account ? {color: "royalblue"} : null]}>Have an account</Text>
                    </TouchableOpacity>                
                </View>

                {!account ? (
                    <>
                        <TextInput
                            style={styles.input}
                            onChangeText={changeRoomId}
                            value={roomId}
                            placeholder="Your room's id..."
                            keyboardAppearance="dark"
                            placeholderTextColor="rgba(255, 255, 255, .6)"
                        />
        
                        <TextInput
                            style={styles.input}
                            onChangeText={setUsername}
                            value={username}
                            placeholder="Your full name..."
                            keyboardAppearance="dark"
                            placeholderTextColor="rgba(255, 255, 255, .6)"

                        />
    
                        <TextInput
                            style={styles.input}
                            onChangeText={setEmail}
                            value={email}
                            placeholder="Your email..."
                            keyboardAppearance="dark"
                            placeholderTextColor="rgba(255, 255, 255, .6)"

                        />
    
                        <TextInput
                            style={styles.input}
                            onChangeText={setPassword}
                            value={password}
                            placeholder="Your password..."
                            keyboardAppearance="dark"
                            secureTextEntry={true}
                            placeholderTextColor="rgba(255, 255, 255, .6)"

                        /> 
                    </>
                ) : (
                    <>
                        <TextInput
                            style={styles.input}
                            onChangeText={setRoomIdAccount}
                            value={roomIdAccount}
                            placeholder="Your room's id..."
                            keyboardAppearance="dark"
                            placeholderTextColor="rgba(255, 255, 255, .6)"

                        />


                        <TextInput
                            style={styles.input}
                            onChangeText={setEmailAccount}
                            value={emailAccount}
                            placeholder="Your email..."
                            keyboardAppearance="dark"
                            placeholderTextColor="rgba(255, 255, 255, .6)"

                        />

                        <TextInput
                            style={styles.input}
                            onChangeText={setPasswordAccount}
                            value={passwordAccount}
                            placeholder="Your password..."
                            keyboardAppearance="dark"
                            secureTextEntry={true}
                            placeholderTextColor="rgba(255, 255, 255, .6)"
                        />
                    </>
                )}

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
                            onPress={async () => !account ? await submitJoin() : await submitJoinAccount()}
                        >
                            <Text style={styles.whiteText}>Join room</Text>
                        </TouchableOpacity>
                    ) : Platform.OS === 'android' ? 
                    (
                        <View style={{width: "100%", maxWidth: 250, marginTop: 35, height: 50}}>
                            <Button
                                title="Submit"
                                backgroundColor="#841584"
                                
                                onPress={async () => !account ? await submitJoin() : await submitJoinAccount()}
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