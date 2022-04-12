import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from "react";
import { TouchableOpacity, Text, View } from "react-native";

import styles from "../Styles/HomeStyles";

export default function AddRoom({ navigation, route }) {

    const {socket, id, admin, user, roomId, newDbId} = route.params;
   

    const createRoom = () => {
        navigation.navigate('CreateRoom', {id: id, socket: socket});
    };

    const joinRoom = () => {
        navigation.navigate('JoinRoom', {id: id, socket: socket});
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