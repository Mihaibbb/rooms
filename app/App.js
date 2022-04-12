import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Components/Home';
import Geolocation from './Components/Geolocation';
import JoinRoom from './Components/JoinRoom';
import CreateRoom from './Components/CreateRoom';
import Users from './Components/Users';
import Rooms from './Components/Rooms';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ 
        headerStyle: {
          backgroundColor: "rgb(0, 33, 71)",
        },
        headerShown: false,
        headerTintColor: "#fff"
      }}>
        <Stack.Screen name="Home" component={Rooms} />
        {/* <Stack.Screen name="Rooms" component={Rooms} options={{ title: 'New Room' }} /> */}
        <Stack.Screen name="Geolocation" component={Geolocation} options={{ title: 'Location' }} />
        <Stack.Screen name="CreateRoom" component={CreateRoom} options={{ title: 'Create room' }} />
        <Stack.Screen name="JoinRoom" component={JoinRoom} options={{ title: 'Join room' }} />
        <Stack.Screen name="Users" component={Users} options={{ title: 'Users status' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
