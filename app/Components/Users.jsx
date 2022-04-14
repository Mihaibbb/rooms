import React, { useState, useEffect } from "react";
import { View, ScrollView, Text } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck, faCommentDollar, faTimes } from '@fortawesome/free-solid-svg-icons';
import UserGeolocation from "./UserGeolocation";

import styles from "../Styles/UsersStyles";

export default function Users({route, navigation}) {

    const {id, socket, roomId, email} = route.params;

    const [rows, setRows] = useState([]);

    useEffect(() => {
        console.warn("Rows", rows);
        if (!roomId) return;
        socket.emit("all_users", roomId, id);

        socket.on("get_rows", currRows => {
            console.warn("My rows", currRows);
            setRows(currRows);

        });
    }, [roomId]);


    socket.on("change_users", currRows => {
        // console.warn("salut")
        setRows(currRows);
    });
   

    return (
        <ScrollView>
            <View style={styles.container}>
            <View style={styles.title}>
                <Text style={styles.titleText}>
                    
                </Text>
                <Text style={styles.textId}>Room's ID:
                    <Text style={styles.bold}> {roomId}</Text>
                </Text> 
            </View>
            {rows.map((row, rowIdx) => { return (
                <View style={styles.element} key={rowIdx}>
                    <Text style={styles.text}>{`${row["username"]} ${row["email"] === email ? "(You)" : ""}`}</Text>
                    { row["user_status"] ? (
                        <FontAwesomeIcon 
                            icon={faCheck}
                            color="green"
                            size={40}
                        />
                    ) : (
                        <FontAwesomeIcon 
                        icon={faTimes}
                        color="#DC143C"
                        size={40}
                    />
                    )}
                </View>
            )})}
            </View>

            <UserGeolocation roomId={roomId} socket={socket} id={1}/>
        </ScrollView>
        
    );
}