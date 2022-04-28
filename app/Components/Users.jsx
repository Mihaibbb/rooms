import React, { useState, useEffect } from "react";
import { View, ScrollView, Text } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck, faCommentDollar, faTimes } from '@fortawesome/free-solid-svg-icons';
import UserGeolocation from "./UserGeolocation";

import styles from "../Styles/UsersStyles";

export default function Users({route, navigation}) {

    const {id, socket, roomId, roomName, email, username} = route.params;

    const [rows, setRows] = useState([]);

    useEffect(() => {
        console.log("Rows", rows);
        if (!roomId) return;
        socket.emit("all_users", roomId, id);

        socket.on("get_rows", currRows => {
            console.log("My rows", currRows);
            setRows(currRows);
        });

        socket.on("update_rooms_sockets", currRows => {
            console.warn("my rows", currRows);
            setRows(currRows);
        });

        socket.on("change_users", currRows => {
            console.log("rows modified")
            setRows(currRows);
        });

    }, [roomId]);
   

    return (
        <View style={styles.scrollContainer}>
            <ScrollView style={styles.container}>
            <View style={styles.title}>
                <Text style={styles.titleText}>
                    {roomName}'s Users
                </Text>
                <Text style={styles.textId}>Room's ID:
                    <Text style={styles.bold}> {roomId}</Text>
                </Text> 
            </View>
            {rows && rows.map((row, rowIdx) => { return (
                <View style={styles.element} key={rowIdx}>
                    <Text style={styles.text}>{`${row["username"]} ${row["email"] === email ? "(You)" : ""}`}</Text>
                    { row["user_status"] ? (
                        <FontAwesomeIcon 
                            icon={faCheck}
                            color="royalblue"
                            size={40}
                        />
                    ) : (
                        <FontAwesomeIcon 
                        icon={faTimes}
                        color="royalblue"
                        size={40}
                    />
                    )}
                </View>
            )})}
            </ScrollView>

            <UserGeolocation roomId={roomId} socket={socket} id={1} email={email} username={username}/>
        </View>
        
    );
}