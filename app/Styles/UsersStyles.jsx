import { StyleSheet, Platform, Dimensions } from "react-native";

const styles = StyleSheet.create({
    scrollContainer: {
        backgroundColor: '#000',
        width: "100%",
        minHeight: Dimensions.get("window").height,
    },

    titleText: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginTop: 25
    },

    container: {
        flex: 1,
        padding: 35,        
       
        borderWidth: 2,
        borderColor: "royalblue",
        borderRadius: Platform.OS === "ios" ? 48 : 0,
        
    },

    element: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginVertical: 15,
        
        color: "#fff",
        backgroundColor: "rgb(24, 24, 24)",
        padding: 10,
        shadowColor: "royalblue",
        shadowOffset: {width: 2, height: 5},
        shadowOpacity: .6,
        shadowRadius: 5,
        borderRadius: 8
    },

    text: {
        fontSize: 22,
        color: "#fff"

    }, 

    title: {
        marginBottom: 20,
     },


    bold: {
        fontWeight: "bold",
        marginLeft: 8
    }
});

export default styles;