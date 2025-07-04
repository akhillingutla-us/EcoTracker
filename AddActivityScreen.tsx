import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddActivityScreen({ navigation }: any) {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const categories = [
    { name: 'Energy Saving', points: 20 },
    { name: 'Transportation', points: 15 },
    { name: 'Recycling', points: 10 },
    { name: 'Water Conservation', points: 12 },
    { name: 'Food Waste Reduction', points: 8 },
    { name: 'Other', points: 5 }
  ];

  const calculatePoints = () => {
    const categoryInfo = categories.find(cat => cat.name === category);
    const basePoints = categoryInfo ? categoryInfo.points : 5;
    const durationBonus = parseInt(duration) || 0;
    return basePoints + Math.min(durationBonus, 30);
  };

  const handleSaveActivity = async () => {
    if (!description.trim() || !category) {
      Alert.alert('Error', 'Please fill in description and category');
      return;
    }

    try {
      const existingData = await AsyncStorage.getItem('activities');
      const activities = existingData ? JSON.parse(existingData) : [];

      const newActivity = {
        id: Date.now().toString(),
        description: description.trim(),
        category,
        duration: duration.trim(),
        notes: notes.trim(),
        points: calculatePoints(),
        timestamp: new Date().toISOString(),
      };

      activities.push(newActivity);
      await AsyncStorage.setItem('activities', JSON.stringify(activities));

      Alert.alert(
        'Success!',
        `Activity saved! You earned ${newActivity.points} points! 🎉`,
        [
          { text: 'Add Another', onPress: () => resetForm() },
          { text: 'Go Home', onPress: () => navigation.navigate('Home') },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save activity');
    }
  };

  const resetForm = () => {
    setDescription('');
    setCategory('');
    setDuration('');
    setNotes('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.form}>
        <View style={styles.inputSection}>
          <Text style={styles.label}>What did you do? *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Turned off lights, Recycled bottles..."
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={[styles.categoryButton, category === cat.name && styles.categoryButtonSelected]}
                  onPress={() => setCategory(cat.name)}
                >
                  <Text style={[styles.categoryText, category === cat.name && styles.categoryTextSelected]}>
                    {cat.name}
                  </Text>
                  <Text style={[styles.categoryPoints, category === cat.name && styles.categoryPointsSelected]}>
                    {cat.points} pts
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., 30"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Additional details..."
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {category && (
          <View style={styles.pointsPreview}>
            <Text style={styles.pointsText}>You'll earn: {calculatePoints()} points</Text>
          </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveActivity}>
          <Text style={styles.saveButtonText}>Save Activity</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  form: { padding: 20 },
  inputSection: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  textInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: 'white' },
  categoryContainer: { flexDirection: 'row', gap: 10 },
  categoryButton: { backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  categoryButtonSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  categoryText: { fontSize: 14, color: '#333' },
  categoryTextSelected: { color: 'white' },
  categoryPoints: { fontSize: 12, color: '#666' },
  categoryPointsSelected: { color: 'white' },
  pointsPreview: { backgroundColor: '#e8f5e8', padding: 15, borderRadius: 8, marginBottom: 20 },
  pointsText: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center' },
  saveButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});