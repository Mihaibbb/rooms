import { StyleSheet, Platform } from 'react-native';

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
    
    corners: {
      fontSize: 20
    },

    text: {
      fontSize: 20,
      color: "#fff"
    },

    clearButton: {
      position: 'absolute',
      bottom: 45,
      borderWidth: 2,
      borderColor: "red",
      borderRadius: 18,
      width: "100%",
      maxWidth: 225,
      minHeight: 45,
      flex: 1,
      justifyContent: 'space-around',
      alignItems: 'center',
      flexDirection: 'row'
    },
    
    clearText: {
      textAlign: 'center',
      fontSize: 20
    },

    icon: {
       marginLeft: 15
    }
});

export default styles;