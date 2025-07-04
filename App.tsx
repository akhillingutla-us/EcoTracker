import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import AddActivityScreen from './screens/AddActivityScreen';
import PhotoScreen from './screens/PhotoScreen';
import StatsScreen from './screens/StatsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#4CAF50" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: any;
              
              switch (route.name) {
                case 'Home':
                  iconName = focused ? 'home' : 'home-outline';
                  break;
                case 'Add':
                  iconName = focused ? 'add-circle' : 'add-circle-outline';
                  break;
                case 'Photos':
                  iconName = focused ? 'camera' : 'camera-outline';
                  break;
                case 'Stats':
                  iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                  break;
                default:
                  iconName = 'circle';
              }
              
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#4CAF50',
            tabBarInactiveTintColor: 'gray',
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'EcoTracker' }}
          />
          <Tab.Screen 
            name="Add" 
            component={AddActivityScreen}
            options={{ title: 'Add Activity' }}
          />
          <Tab.Screen 
            name="Photos" 
            component={PhotoScreen}
            options={{ title: 'Photos' }}
          />
          <Tab.Screen 
            name="Stats" 
            component={StatsScreen}
            options={{ title: 'My Stats' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}