import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from './src/components/Header';
import { KeyEntryView } from './src/components/KeyEntryView';
import { KeyVaultView } from './src/components/KeyVaultView';

export default function App() {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleSelectKey = (key: string) => {
    setActiveKey(key);
  };

  const handleExitKey = () => {
    setActiveKey(null);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar style="dark" />

        <Header
          currentKey={activeKey}
          onExitKey={handleExitKey}
        />

        <View style={styles.mainContainer}>
          {activeKey ? (
            <KeyVaultView
              vaultKey={activeKey}
              onExit={handleExitKey}
            />
          ) : (
            <KeyEntryView
              onSelectKey={handleSelectKey}
            />
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFDF9',
  },
});
