import { StyleSheet, Dimensions, Platform } from "react-native";

const styles = StyleSheet.create({
    container: {
        width: "100%",
        
        alignItems: "center",
        position: "relative",
        height: Dimensions.get("window").height,
        backgroundColor: 'rgb(0, 0, 0)',
        borderWidth: 2,
        borderColor: "royalblue",
        borderRadius: Platform.OS === "ios" ? 48 : 0,
        paddingTop: Platform.OS === "ios" ? 75 : 0,
        paddingHorizontal: 10
    },

    title: {
        fontSize: 35,
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold",
    },

    titleContent: {
       
    },

    content: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        flex: 1
    },

    subroomIcon: {

    
    },

    icon: {
        padding: 20,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: "royalblue",
        marginVertical: 20
    },

    normalText: {
        color: "#888",
        marginTop: 30,
        fontSize: 18,
        lineHeight: 30,
        textAlign: "center"
    },

    boldText: {
        fontWeight: "bold"
    },

    input: {
        width: "100%",
        maxWidth: 250,
        height: 50,
        borderWidth: 2,
        borderColor: "royalblue",
        marginTop: 15,
        borderRadius: 16,
        paddingLeft: 20,
        color: "#fff",
        fontSize: 20
    },

    nextButton: {
        width: "100%",
        maxWidth: 250,
        maxHeight: 60,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 50,
        backgroundColor: "royalblue",
        borderRadius: 16
    },

    buttonText: {
        color: "#fff",
        fontSize: 20,

    }

    
});

export default styles;