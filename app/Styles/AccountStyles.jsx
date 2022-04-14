import { StyleSheet, Dimensions, Platform } from "react-native";

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
});

export default styles;