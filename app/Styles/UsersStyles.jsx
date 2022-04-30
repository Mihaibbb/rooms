import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 50,        
        backgroundColor: '#0D1D2B',
        borderWidth: 2,
        borderColor: "royalblue",
        borderRadius: Platform.OS === "ios" ? 48 : 0,
        width: "100%",
        minHeight: "100%",
    },

    element: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginVertical: 15,
        maxHeight: 37.5,
        color: "#fff",

    },

    text: {
        fontSize: 22,
        color: "#fff"

    }, 

    title: {
        marginBottom: 20,
     },

    titleText: {
        fontSize: 22,
        textAlign: "center",
        color: "#fff"
    },

    bold: {
        fontWeight: "bold",
        marginLeft: 8
    }
});

export default styles;