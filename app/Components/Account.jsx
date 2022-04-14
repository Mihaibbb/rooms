import React, {useState, useEffect} from "react";
import {ScrollView, View, Text, Image} from "react-native";
import styles from "../Styles/AccountStyles";
export default function Account({route, navigation}) {
    
    const {username, fullName, email, profileImage} = route.params;

    return (
        <ScrollView style={styles.container}>
            
        </ScrollView>
    );
};