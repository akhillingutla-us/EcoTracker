import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  TextInput,
  Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

interface Photo {
  id: string;
  uri: string;
  description: string;
  timestamp: string;
}

export default function PhotoScreen() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPhotoUri, setNewPhotoUri] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const photosData = await AsyncStorage.getItem('photos');
      const photosList: Photo[] = photosData ? JSON.parse(photosData) : [];
      setPhotos(photosList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const savePhoto = async (photoUri: string, description: string) => {
    try {
      const newPhoto: Photo = {
        id: Date.now().toString(),
        uri: photoUri,
        description: description || 'Eco-friendly activity',
        timestamp: new Date().toISOString(),
      };

      const existingPhotos = await AsyncStorage.getItem('photos');
      const photosList: Photo[] = existingPhotos ? JSON.parse(existingPhotos) : [];
      photosList.push(newPhoto);

      await AsyncStorage.setItem('photos', JSON.stringify(photosList));
      setPhotos(photosList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      
      Alert.alert('Success!', 'Photo saved successfully! 📸');
    } catch (error) {
      Alert.alert('Error', 'Failed to save photo');
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Add Photo',
      'How would you like to add your eco-activity photo?',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Camera permission is needed to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewPhotoUri(result.assets[0].uri);
      setModalVisible(true);
    }
  };

  const openGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Gallery permission is needed to select photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewPhotoUri(result.assets[0].uri);
      setModalVisible(true);
    }
  };

  const handleSavePhotoWithDescription = () => {
    if (newPhotoUri) {
      savePhoto(newPhotoUri, photoDescription);
      setModalVisible(false);
      setNewPhotoUri('');
      setPhotoDescription('');
    }
  };

  const renderPhoto = ({ item }: { item: Photo }) => (
    <View style={styles.photoItem}>
      <Image source={{ uri: item.uri }} style={styles.photo} />
      <View style={styles.photoInfo}>
        <Text style={styles.photoDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.photoDate}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Eco Photos</Text>
        <TouchableOpacity style={styles.addButton} onPress={showImagePicker}>
          <Ionicons name="camera" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {photos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="camera-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No photos yet</Text>
          <Text style={styles.emptyText}>
            Capture your eco-friendly activities!
          </Text>
          <TouchableOpacity style={styles.firstPhotoButton} onPress={showImagePicker}>
            <Ionicons name="camera" size={20} color="white" />
            <Text style={styles.firstPhotoText}>Add First Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          style={styles.photosList}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Photo Description</Text>
            
            {newPhotoUri ? (
              <Image source={{ uri: newPhotoUri }} style={styles.previewImage} />
            ) : null}
            
            <TextInput
              style={styles.descriptionInput}
              placeholder="What eco-activity is this?"
              value={photoDescription}
              onChangeText={setPhotoDescription}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.savePhotoButton} 
                onPress={handleSavePhotoWithDescription}
              >
                <Text style={styles.savePhotoButtonText}>Save Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  addButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 25, elevation: 3 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#666', marginTop: 20, marginBottom: 10 },
  emptyText: { fontSize: 16, color: '#999', textAlign: 'center', marginBottom: 30 },
  firstPhotoButton: { backgroundColor: '#4CAF50', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  firstPhotoText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  photosList: { flex: 1, padding: 20 },
  photoItem: { backgroundColor: 'white', borderRadius: 12, marginBottom: 15, overflow: 'hidden', elevation: 2 },
  photo: { width: '100%', height: 200, resizeMode: 'cover' },
  photoInfo: { padding: 15 },
  photoDescription: { fontSize: 16, color: '#333', fontWeight: '500' },
  photoDate: { fontSize: 14, color: '#666', marginTop: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', margin: 20, borderRadius: 12, padding: 20, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  previewImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 15, resizeMode: 'cover' },
  descriptionInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, height: 80, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 20 },
  cancelButton: { flex: 1, backgroundColor: '#f5f5f5', padding: 15, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: '#666', fontSize: 16, fontWeight: '500' },
  savePhotoButton: { flex: 1, backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center' },
  savePhotoButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});