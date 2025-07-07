import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { CalendarioScreen } from '../components/CalendarioScreen'
import { NuevaCitaScreen } from '../components/NuevaCitaScreen'
import { DetalleCitaScreen } from '../components/DetalleCitaScreen'
import { ClientesScreen } from '../components/ClientesScreen'
import { TratamientosScreen } from '../components/TratamientosScreen'
import { ConfiguracionScreen } from '../components/ConfiguracionScreen'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

const CalendarioStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Calendario" component={CalendarioScreen} />
    <Stack.Screen name="NuevaCita" component={NuevaCitaScreen} />
    <Stack.Screen name="DetalleCita" component={DetalleCitaScreen} />
  </Stack.Navigator>
)

const ClientesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Clientes" component={ClientesScreen} />
  </Stack.Navigator>
)

const TratamientosStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tratamientos" component={TratamientosScreen} />
  </Stack.Navigator>
)

const ConfiguracionStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
  </Stack.Navigator>
)

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string

            if (route.name === 'CalendarioTab') {
              iconName = 'calendar-today'
            } else if (route.name === 'ClientesTab') {
              iconName = 'people'
            } else if (route.name === 'TratamientosTab') {
              iconName = 'medical-services'
            } else if (route.name === 'ConfiguracionTab') {
              iconName = 'settings'
            } else {
              iconName = 'help'
            }

            return <Icon name={iconName} size={size} color={color} />
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#64748b',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="CalendarioTab" 
          component={CalendarioStack}
          options={{ tabBarLabel: 'Calendario' }}
        />
        <Tab.Screen 
          name="ClientesTab" 
          component={ClientesStack}
          options={{ tabBarLabel: 'Clientes' }}
        />
        <Tab.Screen 
          name="TratamientosTab" 
          component={TratamientosStack}
          options={{ tabBarLabel: 'Tratamientos' }}
        />
        <Tab.Screen 
          name="ConfiguracionTab" 
          component={ConfiguracionStack}
          options={{ tabBarLabel: 'Configuración' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
} 