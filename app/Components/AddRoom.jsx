import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from "react";
import { TouchableOpacity, Text, View } from "react-native";

import styles from "../Styles/HomeStyles";

export default function AddRoom({ navigation, route }) {

    const {socket, id, email, username, fullName} = route.params;
   
    console.warn("email: ", email);
    const createRoom = () => {
        navigation.navigate('CreateRoom', route.params);
    };

    const joinRoom = () => {
        navigation.navigate('JoinRoom', route.params);
    };

    return (
        <View style={styles.container}>
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
        </View>
    );
}