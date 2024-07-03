import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRoadCircleCheck, faUser, faTasks, faPersonRifle, faIdCard } from '@fortawesome/free-solid-svg-icons'; // Import faTasks or any other icon for TaskToUsers
import UsersScreen from './AdminScreens/UserScreen';
import RolesFormData from './AdminScreens/RolesFormData';
import TaskToUsers from './AdminScreens/TaskToUsers';

const Tab = createBottomTabNavigator();

const Admin = () => {
    return (
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, size }) => {
                        let icon;

                        if (route.name === 'Users') {
                            icon = faUser;
                        } else if (route.name === 'RolesFormData') {
                            icon = faIdCard;
                        } else if (route.name === 'TaskToUsers') {
                            icon = faTasks; 
                        }

                        return <FontAwesomeIcon icon={icon} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: 'tomato',
                    tabBarInactiveTintColor: 'black',
                })}
            >
                <Tab.Screen name="Users" component={UsersScreen} />
                <Tab.Screen name="RolesFormData" component={RolesFormData} />
                <Tab.Screen name="TaskToUsers" component={TaskToUsers} />
            </Tab.Navigator>
       
    );
};

export default Admin;
