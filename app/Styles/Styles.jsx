import { Dimensions, StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({


    bigContainer: {
        width: "100%",
        flex: 1,
        position: "relative",
        minHeight: Dimensions.get("window").height,
        backgroundColor: '#0D1D2B',
        borderWidth: 2,
        borderColor: "royalblue",
        borderRadius: Platform.OS === "ios" ? 48 : 0,
    },

    container: {
        width: "100%",
        flex: 1,
        position: "relative",
        maxHeight: Dimensions.get("window").height - 100,
    },

    titleContent: {
        width: "100%",
        position: "absolute",
        top: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    
    title: {
        fontSize: 35,
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
        
    },

    pageContainer: {
        minHeight: "100%",
        position: "relative",
    },

    addButton: {
        flex: 1,
        position: 'absolute',
        bottom: "3%",
        right: 15,
        justifyContent: "center",
        alignItems: "center",
        width: 60,
        height: 60,
        backgroundColor: "#fff",
        borderRadius: 60,

        shadowColor: "rgb(0, 164, 239)",
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.3,
        shadowRadius: 3
    },

    centerText: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: "100%",
        color: "#fff"

    },

    roomContainer: {
        width: "100%",
        minHeight: Dimensions.get("window").height,
        padding: 20,
        marginTop: Platform.OS === "ios" ? 75 : 35,
    },

    room: {
        width: "100%",
        height: "100%",
        maxHeight: 140,
        marginVertical: 20,
        backgroundColor: "#fff",
        flex: 1,
        shadowColor: "royalblue",
        shadowOffset: {width: 5, height: 5},
        shadowOpacity: 0.3,
        shadowRadius: 3,
        borderRadius: 16,
        padding: 10,
        backgroundColor: "royalblue"
    },

    roomTitle: {
        fontSize: 26,
        color: "rgba(255, 255, 255, .95)",
        marginBottom: 8,
    },

    roomCode: {
        color: "rgba(255, 255, 255, .85)",
        fontSize: 16
    },

    roomIcon: {
        
        color: "rgba(255, 255, 255, .85)",
    },

    roomCreator: {
        color: "rgba(255, 255, 255, .85)",
        fontSize: 16,
        position: 'absolute',
        bottom: 10,
        left: 10
    },

    accountContainer: {
        zIndex: 3,
        elevation: 3,
        position: "absolute",
        right: 10,
        top: Platform.OS === "ios" ? 40 : 20,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: "royalblue",
        padding: 10
    },

    statusIcon: {
        position: "absolute",
        top: 5,
        right: 5,
        
    },

    subroomIcon: {
        position: "absolute",
        bottom: 5,
        right: 5,
        padding: 7.5,
        backgroundColor: "#fff",
        borderRadius: 35

    }
});

export default styles;
