import {useState, useEffect} from "react";
import { View, Text, TextInput, Dimensions, Keyboard, TouchableWithoutFeedback, TouchableOpacity, TouchableHighlight } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faHouse, faHouseChimneyUser } from "@fortawesome/free-solid-svg-icons";
import styles from "../Styles/Subroom";

export default function Subroom({route, navigation}) {

    const {socket, id, email, roomId, roomName} = route.params;

    const [roomNameInput, setRoomNameInput] = useState();
    const [subroomId, setSubRoomId] = useState(false);
    const [isKBVisible, setKBVisible] = useState(false);

    const nextStep = () => {
        if (roomNameInput.length < 4) return;
        navigation.navigate("SubroomGeolocation", {...route.params, subroomName: roomNameInput, subroomId: subroomId});
    };  

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKBVisible(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKBVisible(false));
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    useEffect(() => {
        const newRoomId = Math.random().toString(36).substring(2, 10);
        setSubRoomId(newRoomId);
    }, []);
     
    return subroomId && (
        <TouchableWithoutFeedback onPress={() => isKBVisible ? Keyboard.dismiss() : null}>
            <View style={styles.container}>
                
                    <Text style={styles.title}>Create subroom</Text>
                    <Text style={[styles.normalText, {color: "#fff"}]}>Subroom id: <Text style={styles.boldText}>{subroomId}</Text></Text>
               
                    
                    <View style={styles.icon}>
                        <FontAwesomeIcon
                            icon={faHouse}
                            color="royalblue"
                            size={50}
                            style={styles.subroomIcon}
                        />
                    </View>

                    {/* <Text style={styles.normalText}>
                        Here you can create a subroom of the 
                        <Text style={styles.boldText}>{roomName}</Text> room.
                        A subroom is a part of a bigger room (e.g school class in a school is a subroom).
                    </Text> */}

                    <Text style={styles.normalText}>Give your subroom a name: </Text>
                    <TextInput 
                        style={styles.input}
                        value={roomNameInput}
                        onChangeText={setRoomNameInput}
                        onFocus={() => setKBVisible(true)}
                        onBlur={() => setKBVisible(false)}
                        placeholderTextColor="grey"
                        placeholder="Subroom name..."
                        maxLength={20}
                    />

                    <TouchableHighlight 
                        style={styles.nextButton}
                        onPress={() => nextStep()}
                    >
                        <Text style={styles.buttonText}>Setup subroom</Text>
                    </TouchableHighlight>

            </View>
        </TouchableWithoutFeedback>
    );
};