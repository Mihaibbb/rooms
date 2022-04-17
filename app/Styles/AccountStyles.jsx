import { StyleSheet, Dimensions, Platform } from "react-native";

const styles = StyleSheet.create({
    bigContainer: {
        width: "100%",
        flex: 1,
        minHeight: Dimensions.get("window").height,
        justifyContent: "center",
        alignItems: "center"
    },
    container: {
        width: "100%",
        flex: 1,
        minHeight: Dimensions.get("window").height,
        backgroundColor: '#0D1D2B',
        borderWidth: 2,
        borderColor: "royalblue",
        borderRadius: Platform.OS === "ios" ? 48 : 0,
        paddingVertical: 50,
        paddingHorizontal: 15
    },

    accountTitle: {
        fontSize: 28,
        color: "royalblue",
        textAlign: "center"
    },

    photoContainer: {
        width: "100%",
        height: "100%",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        marginTop: 30
    },

    accountPhotoContainer: {
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "royalblue",
        padding: 20
    },

    image: { 
        width: 125,
        height: 125,
        borderRadius: 125
    },

    newImage: {
        backgroundColor: "#fff",
        borderRadius: 50,
        padding: 5,
        position: "absolute",
        bottom: -10,
        right: -5
    },

    accountContent: {
        width: "100%",
        display: "flex",
        flex: 1,
        marginTop: 20,
        
        justifyContent: "space-between",
        alignItems: "center",
    },

    accountContainer: {
        width: "100%",
        height: "100%",
    },

    accountElement: {
        flex: 1,
        flexDirection: "row",
        margin: 10,
        justifyContent: "flex-start"
    },

    elementText: {
        fontSize: 20,
        color: "rgba(255, 255, 255, .8)",
        width: "100%",
        maxWidth: "35%",
        textAlign: "left"
    },

    elementInput: {
        borderBottomWidth: 1,
        borderBottomColor: "royalblue",
        width: "70%",
        color: "rgba(255, 255, 255, .9)",
        fontSize: 19,
        paddingBottom: 5,
        paddingLeft: 5
    },

    updateAccount: {
        width: "100%",
        
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "royalblue",
        padding: 10,
        marginTop: 20,
        borderRadius: 18
    },

    updateText: {
        color: "#fff",
        fontSize: 20
    },

    logout: {
        width: "100%",
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 10
    },

    logoutText: {
        fontSize: 21,
        color: "coral"
    },

    logoutContainer: {
        position: "absolute",
        bottom: 20
    }

});

export default styles;