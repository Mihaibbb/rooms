import {useState, useRef, useEffect} from "react";
import { Dimensions, LogBox, View, Image, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Components/Home';
import Geolocation from './Components/Geolocation';
import JoinRoom from './Components/JoinRoom';
import CreateRoom from './Components/CreateRoom';
import Users from './Components/Users';
import AddRoom from './Components/AddRoom';
import Sign from './Components/Sign';
import Account from './Components/Account';
import Subroom from './Components/Subroom';
import SubroomGeolocation from './Components/SubroomGeolocation';

const Stack = createNativeStackNavigator();

export default function App() {

  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
  ]);

  const [start, setStart] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {toValue: 1, duration: 2000, useNativeDriver: true}).start();
  }, [fadeAnim]);

  setTimeout(() => setStart(true), 2000);

  if (!start && fadeAnim) return (
    <View style={{width: "100%", minHeight: Dimensions.get("window").height, backgroundColor: "#000", flex: 1, justifyContent: "center"}}>
      <Animated.View style={{opacity: fadeAnim}}>
        <Image source={require("./assets/logo.png")} resizeMode="contain" style={{width: "100%"}}/>
      </Animated.View>
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ 
        headerStyle: {
          backgroundColor: "rgb(0, 33, 71)",
        },
        headerShown: false,
        headerTintColor: "#fff"
      }}>
        <Stack.Screen name="Rooms" component={Home}/>
        <Stack.Screen name="AddRoom" component={AddRoom} />
        <Stack.Screen name="Sign" component={Sign} />
        {/* <Stack.Screen name="Rooms" component={Rooms} options={{ title: 'New Room' }} /> */}
        <Stack.Screen name="Geolocation" component={Geolocation} options={{ title: 'Location' }} />
        <Stack.Screen name="SubroomGeolocation" component={SubroomGeolocation} />
        <Stack.Screen name="CreateRoom" component={CreateRoom} options={{ title: 'Create room' }} />
        <Stack.Screen name="Subroom" component={Subroom} />
        <Stack.Screen name="JoinRoom" component={JoinRoom} options={{ title: 'Join room' }} />
        <Stack.Screen name="Users" component={Users} options={{ title: 'Users status' }} />
        <Stack.Screen name="Account" component={Account} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
