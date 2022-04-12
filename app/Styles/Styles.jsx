import { Dimensions, StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({

    container: {
        width: "100%",
        flex: 1,
        position: "relative",
        minHeight: Dimensions.get("window").height,
        backgroundColor: '#0D1D2B',
        borderWidth: 2,
        borderColor: "royalblue",
        borderRadius: Platform.OS === "ios" ? 48 : 0
    },



    pageContainer: {
        minHeight: "100%",
        position: "relative",
    },

    addButton: {
        flex: 1,
        position: 'absolute',
        bottom: "10%",
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

    }
});

export default styles;
