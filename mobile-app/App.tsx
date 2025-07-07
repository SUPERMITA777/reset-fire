import React from 'react'
import { StatusBar } from 'react-native'
import { AppNavigator } from './src/navigation/AppNavigator'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AppNavigator />
    </GestureHandlerRootView>
  )
}

export default App 