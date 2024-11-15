import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Button, View, Alert, Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function HomeScreen() {
  const [command, setCommand] = useState<string | null>(null);
  const [shakeDetected, setShakeDetected] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<any>(null);

  // List of possible commands
  const commands = ["Shake the phone", "Tilt left", "Tilt right"];

  // Function to start a new game round
  const startGame = () => {
    setCommand(commands[Math.floor(Math.random() * commands.length)]);
    setShakeDetected(false); // Reset detection for a new round
  };

  // Function to subscribe to accelerometer updates
  const subscribe = () => {
    setSubscription(
      Accelerometer.addListener(accelerometerData => {
        const { x, y, z } = accelerometerData;

        // Simple shake detection logic based on threshold
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        if (acceleration > 1.5) {
          setShakeDetected(true);
        }
      })
    );

    // Set update interval
    Accelerometer.setUpdateInterval(100);
  };

  // Function to unsubscribe from accelerometer updates
  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  // Start or stop the accelerometer when the component mounts/unmounts
  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, []);

  // Check if user action matches command
  useEffect(() => {
    if (shakeDetected && command === "Shake the phone") {
      Alert.alert("Success!", "You followed the command!");
      startGame();
    }
  }, [shakeDetected, command]);

  return (
    <View style={styles.container}>
      <IconSymbol
        size={310}
        color="#808080"
        name="chevron.left.forwardslash.chevron.right"
        style={styles.headerImage}
      />
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to Simon Says</ThemedText>
      </ThemedView>
      <ThemedText>{command || "Press Start to Play"}</ThemedText>
      <Button title="Start Game" onPress={startGame} />
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Follow the command</ThemedText>
        <ThemedText>
          {Platform.select({
            ios: 'Shake the device to match the command',
            android: 'Shake the phone to match the command',
            web: 'Press the button to start and follow the command'
          })}
        </ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  stepContainer: {
    marginTop: 20,
    gap: 8,
    marginBottom: 8,
  },
});
