
import { Image } from 'expo-image';

const logo = require('@/assets/images/icon.png');
import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
//to put a button in react antive
import { Button, View, Alert, Text, Pressable ,TouchableOpacity, StyleSheet} from 'react-native';
//handle receipt backend calls
import api from '../../Services/api'; // Our API service (Handles backend calls)
//import for camera
import {CameraType, CameraView, useCameraPermissions, CameraMode } from 'expo-camera';
import {useState, useRef } from 'react';
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

//url api
//const API_URL = process.env.API_URL;

import Constants from "expo-constants";

//test
const config = Constants.expoConfig ?? Constants.manifest;

//? for if when Expo loads config differently
const API_URL =  process.env.EXPO_PUBLIC_API_URL;
console.log("API URL:", API_URL);
console.log("API URL:", API_URL);

export default function TabTwoScreen() {
   // call backend test function here 
  const callTest = async () => {
    try {
      const response = await fetch(`${API_URL}/ai/test`);
      const text = await response.text();
      Alert.alert("Backend Response", text);
    } catch (error) {
      Alert.alert("Error", "Could not reach backend");
      console.error(error);
    }
  };

  //call AI test function here
  const callAi = async () =>{
    try{
      const response = await fetch(`${API_URL}/ai/openai-test`);
      const json = await response.json();
      Alert.alert("Open Ai says: ", json.response);
    }catch(error){
      Alert.alert("Error", "could not reach OpenAI");
      console.error(error);
    }
  }

  //call AI with prompt
  const callAiPrompt = async (prompt : string) =>{
    try{
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      Alert.alert("Open Ai says: ", data.response);
    }catch(error){
      Alert.alert("Error", "could not reach OpenAI");
      console.error(error);
    }

  }
  //Ai response
   const [aiResponse, setAiResponse] = useState("");
  //get camera permissions
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  //{console.log (permission?.granted)};
  const ref = useRef<CameraView>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [uri, setUri] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);



  function CameraViewComponent(){ 

      if(!permission) return null; //camera permission still loading
      if (!permission.granted){ // camera permission not granted
        return(
          <View style ={styles.container}>
            <Text>Permission needed to use the camera</Text>
            <Button title="Grant Permission" onPress={() =>{console.log("push granted");
                          requestPermission()
                          console.log(permission.granted);
                          }} />
            {/*For if we do not grant permission */}
            <View style={{ marginTop: 10 }}>
              <Button 
                title="Cancel" 
                color="red"
                onPress={() => setShowCamera(false)} 
              />
            </View>
          </View>
        );
      }
    return (
      <View style={{flex:1, backgroundColor:"black"}}>
        <View style ={{paddingTop: 50, paddingHorizontal:20}}>
          <Button title="Close Camera" onPress ={() => setShowCamera(false)} />
        </View>
      <View style={{flex:1}}>
        {uri ? renderPicture(uri) : renderCamera()}
      </View>
      </View>
    );
  }

  //to send photo uri to backend
const uploadToBackend = async (uri: any) => {
  console.log("Uploading image to backend...", uri);

  const formData = new FormData();

  formData.append("file", {
    uri,
    type: "image/jpeg",
    name: "photo.jpg",
  } as any);

  const response = await fetch(`${API_URL}/ai/image`, {
    method: "POST",
    body: formData,
  });

  console.log("Response status:", response.status);

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const receipt = await response.json();

  console.log("Backend returned:", receipt);

  // OPTIONAL: save to DB
  const save = await api.createReceipt(receipt);
  console.log("receipt saved:", save);

  return receipt; 
};

 const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      setUri(photo.uri);
      //send to backend to send to AI
      const aiResult = await uploadToBackend(photo.uri);
      setAiResponse(aiResult);
    }
  };

  const recordVideo = async () => {
    if (recording) {
      setRecording(false);
      ref.current?.stopRecording();
      return;
    }
    setRecording(true);
    const video = await ref.current?.recordAsync();
    console.log({ video });
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "picture" ? "video" : "picture"));
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

   const renderPicture = (uri: any) => {
    return (
      <View style={{flex: 1}}>
        <Image
          source={{ uri }}
          contentFit="contain"
          style={{ flex: 1 }}
        />
        <Button onPress={() => setUri(null)} title="Take another picture" />
      </View>
    );
  };

   const renderCamera = () => {
    return (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            ref={ref}
            mode={mode}
            facing={facing}
            mute={false}
            responsiveOrientationWhenOrientationLocked
          />
          <View style={styles.shutterContainer}>
            <Pressable onPress={toggleMode}>
              {mode === "picture" ? (
                <AntDesign name="picture" size={32} color="white" />
              ) : (
                <Feather name="video" size={32} color="white" />
              )}
            </Pressable>
            <Pressable onPress={mode === "picture" ? takePicture : recordVideo}>
              {({ pressed }) => (
                <View
                  style={[
                    styles.shutterBtn,
                    {
                      opacity: pressed ? 0.5 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.shutterBtnInner,
                      {
                        backgroundColor: mode === "picture" ? "white" : "red",
                      },
                    ]}
                  />
                </View>
              )}
            </Pressable>
            <Pressable onPress={toggleFacing}>
              <FontAwesome6 name="rotate-left" size={32} color="white" />
            </Pressable>
          </View>
        </View>
    );
  };

//To show only camera
if (showCamera) {
  return <CameraViewComponent />;
}





  return (
    
    <View style={styles.containerT}>
      <View  style={styles.container}>
        <Image style={styles.tinyLogo} source={logo} />
        <Text style={styles.textT}>Receipt  Tracker</Text>
      </View>
      <View  style={styles.containerH}>
        <Text style={styles.textH}>Scan Receipt</Text>
        < TouchableOpacity style={styles.Button}  onPress={() => {console.log("Pressed!");
          console.log(permission?.granted);
                      setShowCamera(true);
        }}>
        <Text style={styles.ButtonText}>Take a Photo</Text>
         <Image style={styles.buttonLogoCam} source={require('@/assets/images/Camera.png')}/>
         </TouchableOpacity>
        <Text style={styles.Or}>Or</Text>
        < TouchableOpacity style={styles.Button}>
        <Text style={styles.ButtonText}>Upload From Gallery</Text>
        <Image style={styles.buttonLogoImg} source={require('@/assets/images/picture.png')}/>
         </TouchableOpacity>
      </View>
    </View>
    
    
  );
}

const styles = StyleSheet.create({
  
  containerT: {
    backgroundColor: '#fdfdfd',
    position: 'relative',
    height: 1000,
    margin: 0,
    padding: 0,
  },
  containerH: {
    backgroundColor: '#fdfdfd',
    position: 'relative',
    top: 45,
    bottom: 35,
    left: 5,
    margin: 0,
    padding: 0,
  },
  container: {
    backgroundColor: '#fdfdfd',
    position: 'relative',
    top: 25,
    left: 5,
  },
  textT: {
    color: '#000000',
    fontFamily: 'Kameron',
    fontSize: 40,
    top: 5,
    bottom: 5,
  },
  textH: {
    color: '#003879',
    fontFamily: 'Inter',
    fontSize: 30,
    top: 0,
  },
  tinyLogo: {
    position: 'absolute',
    width: 50,
    height: 50,
    top: 10,
    right: 25,
  },

  // componet specific styles
Or: {
    color: '#000000',
    fontFamily: 'Cochin',
    fontSize: 30,
    textAlign: 'center',
    top: 35,
    bottom: 35,
  },

  ButtonText: {
    color: '#242424',
    fontFamily: 'Cochin',
    fontSize: 30,
    textAlign: 'center',
    alignSelf: 'center',
    verticalAlign: 'middle',
    bottom: 15,
    width: 200,
  height: 220,
  },
  buttonLogoCam: {
    position: 'absolute',
    width: 48,
    height: 38,
    bottom: 40,
    alignSelf: 'center',
  },
  buttonLogoImg: {
    position: 'absolute',
    width: 47,
    height: 41,
    bottom: 40,
    alignSelf: 'center',
  },

Button: {
  backgroundColor: '#9b9b9b',
 alignSelf: 'center',
 verticalAlign: 'middle',
  color: '#5c5c5c',
  width: 300,
  height: 220,
  top: 35,
    bottom: 35,
},
 //Camera stuff
  cameraContainer: StyleSheet.absoluteFillObject,
  camera: StyleSheet.absoluteFillObject,
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },


});
