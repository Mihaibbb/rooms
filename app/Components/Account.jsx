import React, {useState, useEffect} from "react";
import {ScrollView, View, Text, Image, Touchable, TouchableOpacity, TextInput} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCamera, faUser } from "@fortawesome/free-solid-svg-icons";
import * as ImagePicker from "expo-image-picker";
import styles from "../Styles/AccountStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from "@react-navigation/native";


export default function Account({route, navigation}) {
    
    const {socket, username, fullName, email, profileImage} = route.params;

    const [accountPhoto, setAccountPhoto] = useState(profileImage);
    const [modifiedElements, setModifiedElements] = useState(false);
    const [nameInput, setNameInput] = useState(fullName);
    const [usernameInput, setUsernameInput] = useState(username);
    const [emailInput, setEmailInput] = useState(email);
    const [counter, setCounter] = useState(0);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        });
        console.warn(result);

        if (result.cancelled) return;

        setAccountPhoto(result.uri);

    };

    const submitChanges = async () => {
        if (!modifiedElements) return;
        try {
            await AsyncStorage.setItem("profile_image", JSON.stringify(accountPhoto));
            await AsyncStorage.setItem("name", JSON.stringify(nameInput));
            await AsyncStorage.setItem("username", JSON.stringify(usernameInput));
            await AsyncStorage.setItem("email", JSON.stringify(emailInput));

        } catch(e) {
            console.error(e);
        }
        
        socket.emit("possible_changes", username === usernameInput ? "" : usernameInput, email === emailInput ? "" : emailInput, possible => {
            console.warn("here", possible);
            if (!possible) return;
            console.warn("here2");
            socket.emit("update_users", email, nameInput, usernameInput, emailInput);
            socket.emit("get_rooms", emailInput, newRooms => {
                console.warn("eachroom");
                if (!newRooms) return;
                newRooms.forEach(room => {
                    
                    if (room["admin"]) {
                        room["username"] = usernameInput;
                        room["name"] = nameInput;
                    }
                });

                socket.emit("update_rooms", emailInput, JSON.stringify(newRooms));
                socket.emit("update_user_rooms", email, emailInput, usernameInput, nameInput, JSON.stringify(newRooms));
            
                navigation.navigate("Rooms"); 
            });

            
        });
    };

    const logOut = async () => {
        await AsyncStorage.clear();
        navigation.navigate("Rooms", {loggedParam: null});
    };

    const deleteAccount = async () => {

        socket.emit("get_rooms", email, async rooms => {
            const dbRooms = rooms || [];
            dbRooms.forEach(room => {
                if (room.admin) {
                    socket.emit("delete_room", room.roomId);
                } else socket.emit("delete_user_room", room.roomId, email);
            });
            socket.emit("delete_user", email);
            socket.emit("remove_users_room", username);

            await logOut();
        });

        
    };

    useEffect(() => {
        if (nameInput === fullName && emailInput === email && usernameInput === username && accountPhoto === profileImage) setModifiedElements(false);
        else setModifiedElements(true);
    }, [nameInput, emailInput, usernameInput, accountPhoto]);

    return (
        <View style={styles.bigContainer}>
        <ScrollView style={styles.container}>
            <Text style={styles.accountTitle}>Edit account</Text>

            <View style={styles.photoContainer}>
                {profileImage || accountPhoto ? (
                    <View>
                        <Image 
                            style={styles.image}
                            source={{uri: accountPhoto || profileImage}}
                        />
                        <TouchableOpacity style={styles.newImage} onPress={async () => await pickImage()}>
                            <FontAwesomeIcon
                                color="royalblue"
                                size={20}
                                icon={faCamera}
                            />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View 
                        style={styles.accountPhotoContainer}
                    >
                        <FontAwesomeIcon
                            size={50}
                            icon={faUser}
                            color="royalblue"
                        />
                        <TouchableOpacity style={styles.newImage} onPress={async () => await pickImage()}>
                            <FontAwesomeIcon
                                color="royalblue"
                                size={20}
                                icon={faCamera}
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.accountContent}>
                <View style={styles.accountElement}>
                    <Text style={styles.elementText}>Name: </Text>
                    <TextInput
                        onChangeText={setNameInput}
                        value={nameInput}
                        placeholder="Name..."
                        style={styles.elementInput}
                    />
                </View>

                <View style={styles.accountElement}>
                    <Text style={styles.elementText}>Username: </Text>
                    <TextInput 
                        onChangeText={setUsernameInput}
                        value={usernameInput}
                        placeholder="Username..."
                        style={styles.elementInput}
                    />
                </View>

                <View style={styles.accountElement}>
                    <Text style={styles.elementText}>Email: </Text>
                    <TextInput
                        onChangeText={setEmailInput}
                        value={emailInput}
                        placeholder="Email..."
                        style={styles.elementInput}
                    />
                </View>

                <View style={styles.accountLeave}>

                </View>

            </View>

            {modifiedElements && 
                <TouchableOpacity style={styles.updateAccount} onPress={async () => await submitChanges()}>
                    <Text style={styles.updateText}>Update account</Text>
                </TouchableOpacity>
            }
            
        </ScrollView>

        <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logout} onPress={async () => await logOut()}>
            <Text style={styles.logoutText}>Log out account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logout} onPress={async () => await deleteAccount()}>
            <Text style={styles.logoutText}>Delete account</Text>
        </TouchableOpacity>
        </View>
        </View>
    );
};