import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from "react";
import { TouchableOpacity, Text, View } from "react-native";
import {LinearGradient} from "expo-linear-gradient";

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
             <LinearGradient colors={["royalblue", "#000"]} style={styles.choiceContainer}>
                <TouchableOpacity style={styles.button} onPress={() => createRoom()}>
                    <Text style={styles.bigText}>Create room</Text>
                </TouchableOpacity>
            </LinearGradient>

            <LinearGradient colors={["#000", "royalblue"]} style={styles.choiceContainer}>
                <TouchableOpacity style={styles.button} onPress={() => joinRoom()}>
                    <Text style={styles.bigText}>Join room</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
}