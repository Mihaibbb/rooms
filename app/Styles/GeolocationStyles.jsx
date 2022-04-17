import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1D2B',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: "royalblue",
        borderRadius: Platform.OS === "ios" ? 48 : 0
    },

    buttonContainer: {
        backgroundColor: "rgb(33,150,243)",
        color: "#fff",
        marginTop: 30,
        width: "100%",
        maxWidth: 250,
        height: 65,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8
    },

    buttonText: {
        color: "#fff",
        fontSize: 20,
    },

    coords: {
        fontSize: 22,
        marginTop: 15,
    
    },

    results: {
        marginTop: 30
    },


    text: {
        fontSize: 20,
        color: "#fff"
    },

    coords: {
        fontSize: 22,
        color: "#fff",
        marginTop: 15
    },

    corners: {
        color: "#fff",
        fontSize: 24,
       
    },

    cornerContainer: {
        backgroundColor: "royalblue",
        width: "100%",
        height: "100%",
        maxHeight: 80,
        position: "absolute",
        bottom: 0,
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    coordsContainer: {
        
    }
});

export default styles;