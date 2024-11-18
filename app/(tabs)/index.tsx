import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Button, View, Alert, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { LineChart } from 'react-native-chart-kit';

export default function SimonSaysGame() {
  const [command, setCommand] = useState<string | null>(null);
  const [pathData, setPathData] = useState<number[][]>([]);
  const [tiltDetected, setTiltDetected] = useState(false);
  const [shakeDetected, setShakeDetected] = useState(false);
  const [motionDetected, setMotionDetected] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [showChart, setShowChart] = useState(false);  // State to control chart visibility

  // List of possible commands
  const commands = [
    "Simon Says Tilt left",
    "Simon Says Tilt right",
    "Simon Says Shake",
    "Simon Says Move up",
    "Do not Move",
  ];

  // Function to start a new game round
  const startGame = () => {
    setCommand(commands[Math.floor(Math.random() * commands.length)]);
    setTiltDetected(false);
    setShakeDetected(false);
    setMotionDetected(false);
    setPathData([]); // Reset path data for a new round
    setShowChart(true);  // Show the chart when the game starts
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

        // Track motion (move up) based on y-axis values
        if (command === "Simon Says Move up" && y < -0.2) {
          setMotionDetected(true);
        }

        // Update motion path for visual representation
        setPathData((prevData) => [...prevData, [x, y, z]]);
      })
    );

    // Set update interval
    Accelerometer.setUpdateInterval(100);
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
      <Text style={styles.title}>Simon Says Game</Text>
      
      {/* Command Display */}
      <View style={styles.commandContainer}>
        <Text style={styles.command}>{command || "Press Start to Play"}</Text>
      </View>

      {/* Start Game Button */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={startGame}
      >
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>

      {/* Display Motion Path Chart after button click */}
      {showChart && (
        <LineChart
          data={{
            labels: pathData.map((_, index) => index.toString()),
            datasets: [
              {
                data: pathData.map((point) => point[1]), // Only plotting y-axis for simplicity
              },
            ],
          }}
          width={320}
          height={220}
          chartConfig={{
            backgroundColor: "#1C1C1C",
            backgroundGradientFrom: "#1C1C1C",
            backgroundGradientTo: "#333333",
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: () => "#A8A8A8",
            style: { borderRadius: 16 },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#A8A8A8",
            },
          }}
          style={styles.chart}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212", // Dark background
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00A9FF", // Blue title
    marginBottom: 30,
    textAlign: "center",
    letterSpacing: 1.5,
  },
  commandContainer: {
    marginBottom: 40,
    backgroundColor: "#333333",
    padding: 20,
    borderRadius: 8,
  },
  command: {
    fontSize: 24,
    color: "#A8A8A8", // Light grey text
    textAlign: "center",
  },
  startButton: {
    backgroundColor: "#007AFF", // Blue button
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  chart: {
    marginTop: 30,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#007AFF", // Blue border around chart
    overflow: "hidden",
  },
});
