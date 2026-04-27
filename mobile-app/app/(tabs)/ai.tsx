import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
//to put a button in react antive
import { Button, View, Alert, Text, Pressable } from 'react-native';

//import for camera
import {CameraType, CameraView, useCameraPermissions, CameraMode } from 'expo-camera';
import {useState, useRef } from 'react';
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

//url api
const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
      const response = await fetch(`${API_URL}/api/ai/chat`, {
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
  const formData = new FormData();

  formData.append(
    "file", 
    {
      uri,
      type: "image/jpeg",
      name: "photo.jpg",
    } as any
  );

  const response = await fetch(`${API_URL}/api/ai/image`, {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    body: formData,
  });

  const json = await response.json();   
  //const text = await response.text(); //to test
  //console.log("RAW RESPONSE:", text); //to test
  console.log("AI Response:", json.response);
  //return text;  to test
  return json.response;
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



  //main 
  return (
    
    //copied from the explore page
    <ParallaxScrollView 
          headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
          headerImage={
            <IconSymbol
              size={310}
              color="#808080"
              name="chevron.left.forwardslash.chevron.right"
              style={styles.headerImage}
            />
          }>
          <ThemedView style={styles.titleContainer}>
                  <ThemedText
                    type="title"
                    style={{
                      fontFamily: Fonts.rounded,
                    }}>
                    AI Screen
                  </ThemedText>
            </ThemedView>  
       {/* //putting a button */}
    <View style={styles.container}> 
        <Button
        title="Call backend"
        onPress={callTest}
        color="#841584"
        />
        <Button
        title ="activate camera"
        onPress={() => {console.log("Pressed!");
          console.log(permission?.granted);
                      setShowCamera(true);
        }}/>
         <Button
        title="Call AI"
        onPress={callAi}
        color="#841584"
        />
        <Button
        title="Call AI prompt"
        onPress={() =>callAiPrompt("Write me a haiku")}
        color="#841584"
        />
    </View>
    {aiResponse && (
  <Text style={{ marginTop: 20, fontSize: 16 }}>
    AI says: {aiResponse}
  </Text>
)}
      {showCamera && <CameraViewComponent/>}
    </ParallaxScrollView>
    
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
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
    backgroundColor: "black",
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