import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1D2B',
        maxWidth: "100%",
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: "royalblue",
        borderRadius: Platform.OS === "ios" ? 48 : 0
    },
  
    input: {
        borderWidth: 2,
        borderColor: "royalblue",
        borderStyle: "solid",
        borderRadius: 10,
        width: "100%",
        maxWidth: 250,
        height: 50,
        paddingHorizontal: 5,
        marginVertical: 10,
        fontSize: 18,
        color: "#fff"
    },

    normText: {
        fontSize: 20,
        color: "#fff",
        marginBottom: 16
    },

    idContainer: {
        position: "absolute",
        top: 40,
        
        backgroundColor: "royalblue",
        paddingHorizontal: 20,
        height: 75,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: "100%"
    },


    bottomText: {
        textAlign: 'center',
        fontSize: 20 
    },

    whiteText: {
        color: "#fff",
        fontSize: 18,
        
    },
    
    idText: {
        fontWeight: "bold",
        fontSize: 18,
        textAlign: 'center'
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
      
    account: {
        flexDirection: 'row',
       
    },

    accountContainer: {
        
        flexDirection: "column",
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        marginBottom: 25,
       
       
    },

    accountText: {
        textAlign: 'center',
        fontSize: 20,
        color: "#fff"
    },

    errorsContainer: {
        width: "100%",
        minHeight: 50,
        paddingVertical: 15
    },

    error: {
        fontSize: 20,
        color: '#dc143c',
        textAlign: 'center',
        marginVertical: 10
    }

    
});

export default styles;