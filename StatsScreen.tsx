import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

interface Activity {
  id: string;
  description: string;
  category: string;
  points: number;
  timestamp: string;
}

interface Stats {
  totalPoints: number;
  totalActivities: number;
  averageDaily: number;
  bestCategory: string;
  currentStreak: number;
}

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats>({
    totalPoints: 0,
    totalActivities: 0,
    averageDaily: 0,
    bestCategory: 'None',
    currentStreak: 0,
  });
  const [location, setLocation] = useState<string>('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categoryStats, setCategoryStats] = useState<{[key: string]: number}>({});

  useFocusEffect(
    React.useCallback(() => {
      loadStatsData();
      getCurrentLocation();
    }, [])
  );

  const loadStatsData = async () => {
    try {
      const activitiesData = await AsyncStorage.getItem('activities');
      const activityList: Activity[] = activitiesData ? JSON.parse(activitiesData) : [];
      setActivities(activityList);

      if (activityList.length === 0) {
        return;
      }

      // Calculate total points
      const totalPoints = activityList.reduce((sum, activity) => sum + activity.points, 0);

      // Calculate category breakdown
      const categories: {[key: string]: number} = {};
      activityList.forEach(activity => {
        categories[activity.category] = (categories[activity.category] || 0) + activity.points;
      });
      setCategoryStats(categories);

      // Find best category
      const bestCategory = Object.keys(categories).reduce((a, b) => 
        categories[a] > categories[b] ? a : b, 'None'
      );

      // Calculate current streak
      const streak = calculateStreak(activityList);

      // Calculate average daily (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentActivities = activityList.filter(activity => 
        new Date(activity.timestamp) >= sevenDaysAgo
      );
      const recentPoints = recentActivities.reduce((sum, activity) => sum + activity.points, 0);
      const averageDaily = Math.round(recentPoints / 7);

      setStats({
        totalPoints,
        totalActivities: activityList.length,
        averageDaily,
        bestCategory,
        currentStreak: streak,
      });

    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const calculateStreak = (activities: Activity[]): number => {
    if (activities.length === 0) return 0;

    // Get unique dates with activities
    const uniqueDates = Array.from(new Set(
      activities.map(activity => 
        new Date(activity.timestamp).toDateString()
      )
    )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date();
    
    // Check consecutive days from today backwards
    for (let i = 0; i < 30; i++) { // Check last 30 days max
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateString = checkDate.toDateString();
      
      if (uniqueDates.includes(dateString)) {
        streak++;
      } else if (i > 0) { // Allow today to be empty
        break;
      }
    }

    return streak;
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation('Location permission denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } catch (error) {
      console.error('Location error:', error);
      setLocation('Unable to get location');
    }
  };

  const exportData = async () => {
    try {
      const photosData = await AsyncStorage.getItem('photos');
      const photos = photosData ? JSON.parse(photosData) : [];
      
      const data = {
        activities,
        photos,
        stats,
        exportDate: new Date().toISOString(),
        location,
      };

      Alert.alert(
        'Export Data Summary',
        `📊 Total Activities: ${stats.totalActivities}\n⭐ Total Points: ${stats.totalPoints}\n📸 Photos: ${photos.length}\n📅 Exported: ${new Date().toLocaleDateString()}\n📍 Location: ${location}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete ALL your activities and photos? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['activities', 'photos']);
              loadStatsData();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        },
      ]
    );
  };

  const StatCard = ({ title, value, subtitle, icon, color = '#4CAF50' }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: string;
  }) => (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={30} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Overview Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Impact Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard 
            title="Total Points" 
            value={stats.totalPoints}
            icon="star"
            color="#4CAF50"
          />
          <StatCard 
            title="Activities" 
            value={stats.totalActivities}
            icon="checkmark-circle"
            color="#2196F3"
          />
          <StatCard 
            title="Daily Average" 
            value={stats.averageDaily}
            subtitle="(last 7 days)"
            icon="trending-up"
            color="#FF9800"
          />
          <StatCard 
            title="Current Streak" 
            value={`${stats.currentStreak} days`}
            icon="flame"
            color="#f44336"
          />
        </View>
      </View>

      {/* Category Breakdown */}
      {Object.keys(categoryStats).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points by Category</Text>
          <View style={styles.categoryContainer}>
            {Object.entries(categoryStats)
              .sort(([,a], [,b]) => b - a)
              .map(([category, points]) => (
                <View key={category} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{category}</Text>
                    <Text style={styles.categoryPoints}>{points} pts</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${(points / stats.totalPoints) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              ))}
          </View>
        </View>
      )}

      {/* Location Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Info</Text>
        <View style={styles.locationCard}>
          <Ionicons name="location" size={24} color="#4CAF50" />
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>Current Location</Text>
            <Text style={styles.locationText}>{location || 'Getting location...'}</Text>
          </View>
          <TouchableOpacity onPress={getCurrentLocation}>
            <Ionicons name="refresh" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsContainer}>
          {stats.totalActivities >= 1 && (
            <View style={styles.achievement}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.achievementText}>First Activity! 🎉</Text>
            </View>
          )}
          {stats.totalPoints >= 50 && (
            <View style={styles.achievement}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.achievementText}>50 Points Club! ⭐</Text>
            </View>
          )}
          {stats.totalPoints >= 100 && (
            <View style={styles.achievement}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.achievementText}>100 Points Club! 🌟</Text>
            </View>
          )}
          {stats.currentStreak >= 3 && (
            <View style={styles.achievement}>
              <Ionicons name="flame" size={24} color="#FF5722" />
              <Text style={styles.achievementText}>3-Day Streak! 🔥</Text>
            </View>
          )}
          {stats.currentStreak >= 7 && (
            <View style={styles.achievement}>
              <Ionicons name="flame" size={24} color="#FF5722" />
              <Text style={styles.achievementText}>Week Warrior! 🔥🔥</Text>
            </View>
          )}
          {Object.keys(categoryStats).length === 0 && (
            <View style={styles.noAchievements}>
              <Ionicons name="trophy-outline" size={40} color="#ccc" />
              <Text style={styles.noAchievementsText}>
                Complete activities to unlock achievements!
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.exportButton} onPress={exportData}>
            <Ionicons name="download" size={20} color="white" />
            <Text style={styles.exportButtonText}>Export Data Summary</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.clearButton} onPress={clearAllData}>
            <Ionicons name="trash" size={20} color="#f44336" />
            <Text style={styles.clearButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    margin: 20,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  categoryContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  categoryItem: {
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  categoryPoints: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  locationCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  achievementsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  noAchievements: {
    alignItems: 'center',
    padding: 20,
  },
  noAchievementsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 40,
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  clearButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f44336',
    elevation: 1,
  },
  clearButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});