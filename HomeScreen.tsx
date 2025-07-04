import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Activity {
  id: string;
  description: string;
  points: number;
  timestamp: string;
}

export default function HomeScreen({ navigation }: any) {
  const [totalPoints, setTotalPoints] = useState(0);
  const [todayPoints, setTodayPoints] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const activitiesData = await AsyncStorage.getItem('activities');
      const activities: Activity[] = activitiesData ? JSON.parse(activitiesData) : [];
      
      const total = activities.reduce((sum, activity) => sum + activity.points, 0);
      setTotalPoints(total);

      const today = new Date().toDateString();
      const todayActivities = activities.filter(activity => 
        new Date(activity.timestamp).toDateString() === today
      );
      const todayTotal = todayActivities.reduce((sum, activity) => sum + activity.points, 0);
      setTodayPoints(todayTotal);

      const recent = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
      setRecentActivities(recent);

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getMotivationMessage = () => {
    if (todayPoints >= 50) return "Amazing work today! 🌟";
    if (todayPoints >= 20) return "Great progress! 👍";
    if (todayPoints > 0) return "Good start! Keep going! 💪";
    return "Ready to make an impact? 🌱";
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome to EcoTracker!</Text>
        <Text style={styles.motivationText}>{getMotivationMessage()}</Text>
      </View>

      <View style={styles.pointsContainer}>
        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>Today's Points</Text>
          <Text style={styles.pointsValue}>{todayPoints}</Text>
        </View>
        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>Total Points</Text>
          <Text style={styles.pointsValue}>{totalPoints}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Add')}
          >
            <Ionicons name="add-circle" size={30} color="#4CAF50" />
            <Text style={styles.actionText}>Add Activity</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Photos')}
          >
            <Ionicons name="camera" size={30} color="#FF9800" />
            <Text style={styles.actionText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityContent}>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityDate}>
                  {new Date(activity.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.activityPoints}>+{activity.points}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No activities yet</Text>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={() => navigation.navigate('Add')}
            >
              <Text style={styles.startButtonText}>Add Your First Activity</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  welcomeCard: { backgroundColor: '#4CAF50', padding: 20, margin: 20, borderRadius: 12, alignItems: 'center' },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  motivationText: { fontSize: 16, color: 'white', opacity: 0.9 },
  pointsContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, gap: 12 },
  pointsCard: { flex: 1, backgroundColor: 'white', padding: 20, borderRadius: 12, alignItems: 'center', elevation: 2 },
  pointsLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  pointsValue: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50' },
  section: { margin: 20, marginTop: 0 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  actionButton: { backgroundColor: 'white', padding: 20, borderRadius: 12, alignItems: 'center', elevation: 2, minWidth: 120 },
  actionText: { fontSize: 16, color: '#333', marginTop: 8, fontWeight: '500' },
  activityItem: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  activityContent: { flex: 1 },
  activityDescription: { fontSize: 16, color: '#333', fontWeight: '500' },
  activityDate: { fontSize: 14, color: '#666', marginTop: 4 },
  activityPoints: { fontSize: 18, color: '#4CAF50', fontWeight: 'bold' },
  emptyState: { backgroundColor: 'white', padding: 40, borderRadius: 12, alignItems: 'center', elevation: 1 },
  emptyText: { fontSize: 18, color: '#666', marginTop: 15, marginBottom: 20 },
  startButton: { backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  startButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});