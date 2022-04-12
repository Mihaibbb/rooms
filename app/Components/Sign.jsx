import { Platform } from "expo-modules-core";
import React, { useState, useEffect } from "react";
import { View, Button, Text, TextInput, Keyboard, TouchableWithoutFeedback, TouchableOpacity, TouchableHighlight } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Socket } from "socket.io-client";
import styles from "../Styles/CreateStyles";

const ROOM_LENGTH = 6;

export default function Sign({ route, navigation }) {

    const { id, socket } = route.params;
    console.warn(id);

    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [account, hasAccount] = useState(false);
    const [emailAccount, setEmailAccount] = useState(null);
    const [passwordAccount, setPasswordAccount] = useState(null);
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

    const _storeData = async (value) => {
        console.warn('work', value);
        try {
            const keys = Object.keys(value);
            keys.forEach(async (keyName) => {
                await AsyncStorage.setItem(keyName, JSON.stringify(value[keyName]));
            });

            console.warn("local storage async");
            
        } catch(e) {
            console.warn("error", e);
        }
    };

    const submitJoin = async () => {
        let errors = "";

        if (username.length < 3) {
            errors += "Username must have at least 3 characters.";
        }

        if (password.length < 8) {
            errors += "Password must have at least 8 characters.";
        }

        if (password !== rePassword) {
            errors += "Passwords are not the same!";
        }

        let countsAt = 0;
        const emailChars = email.split("");
        emailChars.forEach(character => character === '@' ? countsAt++ : null);

        if (countsAt != 1) {
            errors += "Email doesn't have a valid form.";
        };

        socket.emit("account_exists", email, username, async (sameAcc) => {
            if (sameAcc) errors += "The account has already been registered.";
            
            let newErrs = errors.split(".");
            setErrors(newErrs);
            if (errors.length > 0) return;

            socket.emit("register", fullName, username, email, password, async (foundDbId) => {
                const room = {
                    username: username,
                    id: id,
                    email: email,
                    name: fullName,
                    logged: true
                };

                await _storeData(room);
                setTimeout(() => navigation.navigate('Rooms', {dbId: foundDbId}), 500);
            });
           
        });
    };

    const submitJoinAccount = async () => {
        let errors = "";
        if (passwordAccount.length < 8) errors += "Password must have at least 8 characters.";

        let countsAt = 0;
        const emailChars = emailAccount.split("");
        emailChars.forEach(character => character === '@' ? countsAt++ : null);
        if (countsAt != 1) errors += "Email doesn't have a valid form.";

        socket.emit("login", emailAccount, passwordAccount, async (foundDbId) => {
            if (!foundDbId) errors += "The email and/or password are incorrect.";
            
            const newErrs = errors.split(".");
            setErrors(newErrs);
            if (errors.length > 0) return;
            console.warn("ROOMS", foundDbId.rooms);
            const room = {
                name: foundDbId.name,
                username: foundDbId.username,
                id: id,
                dbId: foundDbId.id,
                email: foundDbId.email,
                rooms: foundDbId.rooms,
                logged: true
            };
            
            console.warn("ID: ", foundDbId.id);
            console.warn("FINALLY 2");
            
            await _storeData(room);
            
            console.warn("In socket dbId", foundDbId.id);

            setTimeout(() => navigation.navigate('Rooms', {dbId: foundDbId.id}), 500);
        });

    };
    
    return (
        <TouchableWithoutFeedback onPress={() => isKBVisible ? Keyboard.dismiss() : null}>
            <View style={styles.container}>

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
                        <View style={styles.inputContainer}>
            
                            <TextInput
                                style={styles.input}
                                onChangeText={setFullName}
                                value={fullName}
                                placeholder="Name..."
                                keyboardAppearance="dark"
                                placeholderTextColor="rgba(255, 255, 255, .6)"
                            />

                            <TextInput 
                                style={styles.input}
                                onChangeText={setUsername}
                                value={username}
                                placeholder="Username..."
                                keyboardAppearance="dark"
                                placeholderTextColor="rgba(255, 255, 255, .6)"
                            />
        
                            <TextInput
                                style={styles.input}
                                onChangeText={setEmail}
                                value={email}
                                placeholder="Email..."
                                keyboardAppearance="dark"
                                placeholderTextColor="rgba(255, 255, 255, .6)"

                            />
        
                            <TextInput
                                style={styles.input}
                                onChangeText={setPassword}
                                value={password}
                                placeholder="Password..."
                                keyboardAppearance="dark"
                                secureTextEntry={true}
                                placeholderTextColor="rgba(255, 255, 255, .6)"
                            /> 

                            <TextInput
                                style={styles.input}
                                onChangeText={setRePassword}
                                value={rePassword}
                                placeholder="Repeat password..."
                                keyboardAppearance="dark"
                                secureTextEntry={true}
                                placeholderTextColor="rgba(255, 255, 255, .6)"
                            /> 
                        </View>
                    ) : (
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                onChangeText={setEmailAccount}
                                value={emailAccount}
                                placeholder="Email..."
                                keyboardAppearance="dark"
                                placeholderTextColor="rgba(255, 255, 255, .6)"

                            />

                            <TextInput
                                style={styles.input}
                                onChangeText={setPasswordAccount}
                                value={passwordAccount}
                                placeholder="Password..."
                                keyboardAppearance="dark"
                                secureTextEntry={true}
                                placeholderTextColor="rgba(255, 255, 255, .6)"
                            />
                        </View>
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
                                <Text style={styles.whiteText}>{!account ? "Sign up" : "Sign in"}</Text>
                            </TouchableOpacity>
                        ) : Platform.OS === 'android' ? 
                        (
                            <View style={{width: "100%", maxWidth: 250, marginTop: 35, height: 50}}>
                                <Button
                                    title={!account ? "Sign up" : "Sign in"}
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