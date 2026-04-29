import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, StyleSheet, ScrollView, Button, Alert, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions, CameraMode } from 'expo-camera';
import { useState, useRef } from 'react';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import api from '../../Services/api';

const logo = require('@/assets/images/icon.png');
const API_URL = process.env.EXPO_PUBLIC_API_URL;



export default function Index() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const ref = useRef<CameraView>(null);
  const [mode, setMode] = useState<CameraMode>('picture');
  const [uri, setUri] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  function CameraViewComponent() {
    const handleCloseCamera = () => {
      Alert.alert('Close Camera', 'What would you like to do?', [
        {
          text: 'Exit Camera',
          style: 'cancel',
          onPress: () => setShowCamera(false),
        },
        {
          text: 'Process Receipt',
          onPress: () => router.push('/create-receipt'),
        },
      ]);
    };

    if (!permission) return null;
    if (!permission.granted) {
      return (
        <View style={styles.permissionContainer}>
          <Text>Permission needed to use the camera</Text>
          <Button
            title="Grant Permission"
            onPress={() => {
              requestPermission();
            }}
          />
          <View style={{ marginTop: 10 }}>
            <Button title="Cancel" color="red" onPress={() => setShowCamera(false)} />
          </View>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <View style={{ paddingTop: 50, paddingHorizontal: 20 }}>
          <Button title="Close Camera" onPress={() => handleCloseCamera()} />
        </View>
        <View style={{ flex: 1 }}>{uri ? renderPicture(uri) : renderCamera()}</View>
      </View>
    );
  }

  const uploadToBackend = async (photoUri: string) => {
    const formData = new FormData();
    formData.append('file', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    const response = await fetch(`${API_URL}/ai/imageName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const receipt = await response.json();
    const save = await api.createReceipt(receipt);
    return save;
  };

  const takePicture = async () => {
    const photo = await ref.current?.takePictureAsync();
    if (photo?.uri) {
      setUri(photo.uri);
      await uploadToBackend(photo.uri);
    }
  };

  const recordVideo = async () => {
    if (recording) {
      setRecording(false);
      ref.current?.stopRecording();
      return;
    }
    setRecording(true);
    await ref.current?.recordAsync();
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'picture' ? 'video' : 'picture'));
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  };

  const renderPicture = (photoUri: string) => {
    return (
      <View style={{ flex: 1 }}>
        <Image source={{ uri: photoUri }} contentFit="contain" style={{ flex: 1 }} />
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
            {mode === 'picture' ? (
              <AntDesign name="picture" size={32} color="white" />
            ) : (
              <Feather name="video" size={32} color="white" />
            )}
          </Pressable>
          <Pressable onPress={mode === 'picture' ? takePicture : recordVideo}>
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : 1,
                  },
                ]}>
                <View
                  style={[
                    styles.shutterBtnInner,
                    {
                      backgroundColor: mode === 'picture' ? 'white' : 'red',
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

  if (showCamera) {
    return <CameraViewComponent />;
  }

  return (
    <View style={styles.containerT}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Text style={styles.textT}>Receipt Tracker</Text>
          <Image style={styles.tinyLogo} source={logo} />
        </View>
        <View style={styles.containerH}>
          <Text style={styles.textH}>Scan Receipt</Text>

          <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => setShowCamera(true)}>
            <Text style={styles.cardHint}>Take a Photo</Text>
            <View style={styles.iconArea}>
              <Ionicons name="camera-outline" size={52} color="#000000" />
            </View>
          </TouchableOpacity>

          <Text style={styles.or}>Or</Text>

          <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            <Text style={[styles.cardHint, styles.cardHintTwoLines]}>
              Upload from{'\n'}Gallery
            </Text>
            <View style={styles.iconArea}>
              <Ionicons name="image-outline" size={52} color="#000000" />
            </View>
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity onPress={() => router.push('/create-receipt')}>
              <Text style={styles.actionText}>Save Receipt</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setUri(null)}>
              <Text style={[styles.actionText, styles.actionRight]}>Cancel</Text>
            </TouchableOpacity>
          </View>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerT: {
    backgroundColor: '#FDFEFF',
    flex: 1,
  },
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 40,
    paddingBottom: 40,
  },

  // "BrandNav"-like header row
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 69,
    paddingTop: 0,
    marginBottom: 24,
  },

  textT: {
    color: '#000000',
    fontSize: 32,
    lineHeight: 32,
    textAlign: 'center',
    fontWeight: '700',
    flex: 1,
    fontFamily: 'Kameron_700Bold',
    alignSelf: 'center',
  },
  tinyLogo: {
    width: 67,
    height: 67,
  },

  // Screen title + form
  containerH: {
    marginTop: 0,
  },
  textH: {
    fontSize: 24,
    lineHeight: 32,
    color: '#173372',
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 24,
    fontFamily: 'Inter_700Bold',
  },

  fieldLabel: {
    width: '100%',
    maxWidth: 342,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 6,
    fontFamily: 'Inter_400Regular',
  },

  input: {
    width: '100%',
    maxWidth: 342,
    height: 46,
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
    color: '#000000',
    fontFamily: 'Inter_400Regular',
  },

  hint: {
    width: '100%',
    maxWidth: 342,
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
    marginBottom: 24,
    fontFamily: 'Inter_400Regular',
  },

  card: {
    width: '100%',
    maxWidth: 342,
    minHeight: 199,
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 24,
  },

  cardPressed: {
    opacity: 0.92,
  },

  cardHint: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '400',
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Inter_400Regular',
  },

  cardHintTwoLines: {
    lineHeight: 26,
  },

  iconArea: {
    marginTop: 4,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  or: {
    width: '100%',
    maxWidth: 340,
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    alignSelf: 'center',
    color: '#000000',
    fontWeight: '700',
    marginVertical: 14,
    fontFamily: 'Inter_700Bold',
  },

  actions: {
    width: '100%',
    maxWidth: 342,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },

  actionText: {
    fontSize: 24,
    lineHeight: 34,
    color: '#000000',
    fontWeight: '400',
    fontFamily: 'JacquesFrancois_400Regular',
  },

  actionRight: {
    textAlign: 'right',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: StyleSheet.absoluteFillObject,
  camera: StyleSheet.absoluteFillObject,
  shutterContainer: {
    position: 'absolute',
    bottom: 44,
    left: 0,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: 'transparent',
    borderWidth: 5,
    borderColor: 'white',
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
});