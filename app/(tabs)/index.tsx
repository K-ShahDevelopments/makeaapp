import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Button, View, Alert } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LineChart } from 'react-native-chart-kit';

export default function SimonSaysGame() {
  const [command, setCommand] = useState<string | null>(null);
  const [pathData, setPathData] = useState<number[][]>([]);
  const [tiltDetected, setTiltDetected] = useState(false);
  const [shakeDetected, setShakeDetected] = useState(false);
  const [motionDetected, setMotionDetected] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [gyroscopeData, setGyroscopeData] = useState<any>(null);

  // List of possible commands
  const commands = ["Simon Says Tilt left", "Simon Says Tilt right", "Simon Says Shake", "Simon Says Move up", "Do not Move"];

  // Function to start a new game round
  const startGame = () => {
    setCommand(commands[Math.floor(Math.random() * commands.length)]);
    setTiltDetected(false);
    setShakeDetected(false);
    setMotionDetected(false);
    setPathData([]); // Reset path data for a new round
  };

  // Function to subscribe to sensor updates
  const subscribe = () => {
    setSubscription(
      Accelerometer.addListener(({ x, y, z }) => {
        // Detect shake
        const shake = Math.sqrt(x * x + y * y + z * z) > 1.5;
        if (shake && command === "Simon Says Shake") {
          setShakeDetected(true);
        }
        
        // Detect tilt based on x-axis values
        if (command === "Simon Says Tilt left" && x < -0.2) {
          setTiltDetected(true);
        } else if (command === "Simon Says Tilt right" && x > 0.2) {
          setTiltDetected(true);
        }
        
        // Track phone motion path
        if (command === "Simon Says Move up" && y < -0.2) {
          setMotionDetected(true);
        }
        
        // Update motion path for visual representation
        setPathData(prevData => [...prevData, [x, y, z]]);
      })
    );

    // Gyroscope for more detailed motion tracking
    Gyroscope.addListener((data) => {
      setGyroscopeData(data);
    });

    // Set update interval
    Accelerometer.setUpdateInterval(100);
    Gyroscope.setUpdateInterval(100);
  };

  // Unsubscribe when the component unmounts
  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, []);

  // Simon Says logic
  useEffect(() => {
    if (command && command.startsWith("Simon Says")) {
      // Check for correct action
      if (tiltDetected || shakeDetected || motionDetected) {
        Alert.alert("Success!", "You followed the command!");
        startGame();
      }
    } else if (tiltDetected || shakeDetected || motionDetected) {
      Alert.alert("Oops!", "Simon didn't say that!");
      startGame();
    }
  }, [tiltDetected, shakeDetected, motionDetected]);

  return (
    <View style={styles.container}>
      <IconSymbol
        size={310}
        color="#808080"
        name="chevron.left.forwardslash.chevron.right"
        style={styles.headerImage}
      />
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Simon Says Game</ThemedText>
      </ThemedView>
      <ThemedText>{command || "Press Start to Play"}</ThemedText>
      <Button title="Start Game" onPress={startGame} />
      
      {/* Display Motion Path */}
      <LineChart
        data={{
          labels: pathData.map((_, index) => index.toString()),
          datasets: [
            {
              data: pathData.map(point => point[1]), // Only plotting y-axis for simplicity
            }
          ]
        }}
        width={320}
        height={220}
        chartConfig={{
          backgroundColor: '#f5f5f5',
          backgroundGradientFrom: '#f5f5f5',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: () => '#808080',
          style: { borderRadius: 8 },
          propsForDots: {
            r: '3',
            strokeWidth: '1',
            stroke: '#808080',
          },
        }}
        style={styles.chart}
      />
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
  chart: {
    marginTop: 20,
    borderRadius: 8,
  }
});
