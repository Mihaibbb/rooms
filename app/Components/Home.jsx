import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, ScrollView, TouchableOpacity, Text, Image, Pressable, Modal } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPlus, faBan, faRecycle, faTrashCan, faUsers, faUser, faCrown, faTimes, faCheck, faHouseChimney, faHouseChimneyUser } from "@fortawesome/free-solid-svg-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io }  from 'socket.io-client'; 
import UserGeolocation from "./UserGeolocation";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import * as Linking from "expo-linking";
import styles from "../Styles/Styles";
import { BlurView } from "expo-blur";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export default function Home({ route, navigation }) {
    
    const {roomsParam} = route?.params ? route.params : {1: null};
    const isFocused = useIsFocused();


    
    const deleteStorage = async () => {
        const keys = await AsyncStorage.getAllKeys();
        await AsyncStorage.multiRemove(keys);
    };

    const [socket, setSocket] = useState(null);
    const [id, setId] = useState(null);
    const [start, setStart] = useState(false);
    const [rooms, setRooms] = useState(route.params?.rooms);
    const [email, setEmail] = useState(null);
    const [username, setUsername] = useState(null);
    const [fullName, setFullName] = useState(null);
    const [logged, setLogged] = useState(route?.params?.loggedParam);
    const [profileImage, setProfileImage] = useState(null);
    const [addButtonHeight, setAddButtonHeight] = useState(null);
    const [accountPhoto, setAccountPhoto] = useState(null);
    const [currRoomsStatus, setCurrRoomsStatus] = useState(null);
    const [subCurrRoomsStatus, setSubCurrRoomsStatus] = useState();
    const [disappearFade, setDisappearFade] = useState(false);
    const [isFade, setIsFade] = useState(-1);
    const [activateSubRooms, setActivateSubrooms] = useState(false);
    const [titleNotification, setTitleNotification] = useState(null);
    const [bodyNotification, setBodyNotification] = useState(null);

    const notificationListener = useRef();
    const responseListener = useRef();

    const statusCallback = (roomsStatus) => {
        setCurrRoomsStatus(roomsStatus);
    };

    const subStatusCallback = (subRoomsStatus) => {
        console.warn("SUBROOMS: ", subRoomsStatus)
        setSubCurrRoomsStatus(subRoomsStatus);
    };

    useEffect(async () => {
        const url = await Linking.getInitialURL();
        let newUrl = "", startIdx, endIdx;
        
        for (startIdx = 0; startIdx < url.length && isNaN(url[startIdx]); startIdx++)
        for (endIdx = url.length - 1; endIdx >= 0 && url[endIdx] !== ":"; endIdx--);
        for (let letter = startIdx; letter < endIdx; letter++)
            newUrl += url[letter];
        
        console.warn("URL: ", newUrl);

        AsyncStorage.getAllKeys().then(data => {
            console.warn("STORAGE: ", data);
            data.forEach(async key => console.warn(key, await AsyncStorage.getItem(key)));
        });

        let newSocket = io(`http://${newUrl}:3000`);
        newSocket.on("connect", () => {
            console.warn("connect../.");
        })
        newSocket.emit('new_connection', "Connected");
        // console.warn("gg");
        
        newSocket.on("get_id", newId => {
            setId(newId);
            // console.warn("salut", newId);
        });

        setSocket(newSocket);
        console.warn("ok socket");
        
    }, []);

    useEffect(async () => {
        // await deleteStorage();
        console.warn("h", id, socket);
        if (!socket || !id) return;
        console.warn("hh");
        try {

            const loggedLS = await AsyncStorage.getItem("logged") ? JSON.parse(await AsyncStorage.getItem("logged")) : null;
            await loggedLS && setLogged(await loggedLS);
            console.warn("logged: ", await loggedLS);

            const emailLS = await AsyncStorage.getItem("email") && loggedLS ? JSON.parse(await AsyncStorage.getItem("email")) : null;
            const usernameLS = await AsyncStorage.getItem("username") && loggedLS ? JSON.parse(await AsyncStorage.getItem("username")) : null;
            await emailLS && setEmail(await emailLS);
            await usernameLS && setUsername(await usernameLS);
            console.warn("Email & username", await emailLS, await usernameLS);
            
            emailLS && usernameLS && socket.emit("account_exists", emailLS, usernameLS, async exists => {
                console.warn("EXISTS", exists);
                if (!exists) await deleteStorage();
            });  
            
            const areRooms = await loggedLS && await AsyncStorage.getItem("rooms");
            if (areRooms && !roomsParam && await loggedLS) setRooms(JSON.parse(areRooms));
            console.warn(JSON.parse(areRooms) && JSON.parse(areRooms)[0]?.roomId);
            console.warn(await loggedLS);

            await loggedLS && await emailLS && socket.emit("get_rooms", await emailLS, async dbRooms => {
                const newRooms = dbRooms || [];
                console.log("new rooms: ", newRooms);
                setRooms(newRooms);
                await AsyncStorage.setItem("rooms", JSON.stringify(newRooms));
            });

            const fullNameLS = await loggedLS && await AsyncStorage.getItem("name") ? JSON.parse(await AsyncStorage.getItem("name")) : null;
            await fullNameLS && setFullName(await fullNameLS);

            const profileImageLS = await loggedLS && await AsyncStorage.getItem("profile_image") && JSON.parse(await AsyncStorage.getItem("profile_image"));
            console.warn("Profile image: ", await profileImageLS, await loggedLS);
            setAccountPhoto(await profileImageLS);
            setProfileImage(await profileImageLS);
            console.warn("Socket id: ", id);
            emailLS && loggedLS && areRooms && socket.emit("update_id", id, emailLS, JSON.parse(areRooms));
            setStart(true);
            console.log("START");
            socket.on("new_notification", (title, body) => {
                console.log("NOTIFICATION");
                setTitleNotification(title);
                setBodyNotification(body);
            });

        } catch (e) {
            console.error("ERROR: ", e);
        }
    }, [socket, id, isFocused]);

    useEffect(() => {
        if (!rooms) return;
        console.warn("NEW ROOMS: ", rooms, roomsParam, logged, currRoomsStatus);
        //route?.params?.loggedParam && setLogged(route.params.loggedParam);
    }, [rooms, isFocused]);

    // Notification effects

    useEffect(() => {
        registerPushNotifications().then(token => console.log(token));
    
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log(notification);
        });
    
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });
    
        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    useEffect(() => {
        if (!titleNotification || !bodyNotification) return;
        (async function () {
            await schedulePushNotification(titleNotification, bodyNotification);
        })();
    }, [titleNotification, bodyNotification]);

    useFocusEffect(
        useCallback(() => {
            setDisappearFade(false);
            return () => {
                setDisappearFade(true);
            };
        }, [])
    );

    return (
        <View style={styles.bigContainer}>
            <Modal transparent={true} visible={disappearFade ? false : true} animationType="fade">
                <BlurView intensity={isFade !== -1 ? 25 : 0} style={{height: "100%"}}>
            
                    <ScrollView style={[styles.container, {zIndex: isFade !== -1 ? -1 : 0}]}>
                        <View style={styles.pageContainer}>
                            
                            {logged && (
                                <TouchableOpacity 
                                    style={styles.accountContainer}
                                    onPress={(e) => {
                                        setDisappearFade(true);
                                        navigation.navigate("Account", {socket: socket, username: username, fullName: fullName, email: email, profileImage: profileImage});
                                        console.warn("EVENT: ", e);
                                    }}
                                >
                                
                                    <FontAwesomeIcon
                                        size={25}
                                        icon={faUser}
                                        color="royalblue"
                                    />

                                </TouchableOpacity>
                            )}

                            <View style={styles.titleContent}>
                                <Text style={styles.title}>Rooms</Text>
                            </View>

                    
                            {!rooms || rooms.length === 0 ? (
                                <View style={styles.centerText}>
                                    <Text style={{fontSize: 36, color: "rgba(255, 255, 255, .4)"}}>No rooms</Text>
                                </View>
                            ) : (
                                <View style={styles.roomContainer}>
                                    
                                    {currRoomsStatus && [...rooms].map((room, roomIdx) => {
                                        return (
                                            <>
                                            <Pressable 
                                                style={[styles.room, {zIndex: isFade === roomIdx ? 1 : 0}]} key={roomIdx} 
                                                onPress={() => {
                                                    if (!room.admin) return;
                                                    room.admin && navigation.navigate("Users", {id, socket, roomId: room.roomId, roomName: room.roomName, email, username: username});
                                                }}
                                          
                                            >
                                                <Text style={styles.roomTitle}>
                                                    {room.roomName}
                                                    <FontAwesomeIcon
                                                        style={styles.roomIcon}
                                                        icon={room.admin ? faCrown : faUser}
                                                        size={15}
                                                    />
                                                </Text>
                                                <Text style={styles.roomCode}>Room's id: {room.roomId}</Text>
                                                <Text style={styles.roomCreator}>Created by {room.username}</Text>
                                                
                                                <FontAwesomeIcon
                                                    style={styles.statusIcon}
                                                    icon={currRoomsStatus[roomIdx] ? faCheck : faTimes}
                                                    color="#fff"
                                                    size={30}
                                                />
                                                <TouchableOpacity 
                                                    style={styles.subroomIcon}
                                                    onPress={() => {
                                                        //setDisappearFade(true);
                                                        setActivateSubrooms(currIdx => currIdx !== false ? false : roomIdx);
                                                    }}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faHouseChimneyUser}
                                                        color="royalblue"
                                                        size={25}
                                                    />
                                                </TouchableOpacity>

                                              

                                            </Pressable>

                                            {activateSubRooms === roomIdx && <ScrollView style={styles.subRoomsContainer}>
                                                <Text style={styles.subRoomsTitle}>{room.roomName}'s Subrooms</Text>
                                                {room.subRooms && room.subRooms.length > 0 && room.subRooms.map((subRoom, subRoomIdx) => {
                                                    return (
                                                        <View style={styles.subRoom}>
                                                            <Text style={styles.subRoomText}>{subRoom.roomName}</Text>
                                                            <FontAwesomeIcon 
                                                                color={"royalblue"}
                                                                size={35}
                                                                icon={subCurrRoomsStatus && subCurrRoomsStatus[roomIdx] && subCurrRoomsStatus[roomIdx][subRoomIdx] ? faCheck : faTimes}
                                                            />
                                                        </View>
                                                    );
                                                })}
                                                 {room.admin && <TouchableOpacity 
                                                    style={styles.subRoomAdd}
                                                    onPress={() => email && socket && id && navigation.navigate("Subroom", {socket: socket, id: id, roomId: room.roomId, email: email, roomName: room.roomName, roomGeolocation: room.geolocation.split(" ")})}
                                                >
                                                    <FontAwesomeIcon 
                                                        color={"royalblue"}
                                                        size={35}
                                                        icon={faPlus}
                                                    />
                                                    {<Text style={[styles.subRoomText, {color: "grey"}]}>Add a room...</Text>}
                                                </TouchableOpacity>}
                                            </ScrollView>}
                                            </>
                                        );
                                    })}
                                </View>
                            )}

                            
                        </View>

                        {logged && rooms && email && username && (
                            <UserGeolocation socket={socket} email={email} username={username} rooms={rooms} statusCallback={statusCallback} subStatusCallback={subStatusCallback} />
                        )}    
                    </ScrollView>
                    
                    <View style={styles.addButton}>
                        <TouchableOpacity
                            onPress={() => {
                                setDisappearFade(true);
                                logged && email && username && fullName ?
                                navigation.navigate("AddRoom", {socket: socket, id: id, email: email, username: username, fullName : fullName}) : 
                                navigation.navigate("Sign", {socket, id})
                            }}
                        >
                            <FontAwesomeIcon 
                                icon={faPlus}
                                size={35}
                                color="royalblue"
                            />
                        </TouchableOpacity>
                                
                    </View>
                    </BlurView>
            </Modal>
        </View>
    );
}

const schedulePushNotification = async (title, body) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            
        },

        trigger: {
            seconds: 2
        }
    });
};

const registerPushNotifications = async () => {
    let token;

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
        const {status} = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        return;
    }   
    const tokenAsync = await Notifications.getExpoPushTokenAsync();
    if (!tokenAsync) return;
    token = tokenAsync.data;
    console.log("TOKEN: ", token);

    } catch(e) {
        console.log("ERROR: ", e);
    }

    
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return token;
};