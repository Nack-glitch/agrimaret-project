import React, { useState } from "react";
import { View,Text,TextInput,TouchableOpacity,StyleSheet,Alert,ScrollView,} from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const SERVER_URL = "http://localhost:3000";

export default function AuthScreen({ onClose, onNavigate }) {
  const { login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState("client"); 
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "", 
    farmName: "",
    location: "",
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };


  const farmerData = {
    name: form.name,
    email: form.email,
    password: form.password,
    phoneNumber: form.phoneNumber,
    farmName: form.farmName,
    location: form.location,
    role: "farmer",
  };

  const clientData = {
    name: form.name,
    email: form.email,
    password: form.password,
    phoneNumber: form.phoneNumber,
    role: "client",
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    try {
      const res = await axios.post(`${SERVER_URL}/auth/login`, {
        email: form.email,
        password: form.password,
      });
      if (res.data.token) {
        login(res.data.user, res.data.token);
        Alert.alert("Success", `Welcome back, ${res.data.user.name}!`);
        onClose?.();
        if (res.data.user.role === "farmer") onNavigate?.("dashboard");
        else onNavigate?.("marketplace");
      }
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert("Error", "Invalid credentials");
    }
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.phoneNumber) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (role === "farmer" && (!form.farmName || !form.location)) {
      Alert.alert("Error", "Please fill farm name and location");
      return;
    }

    try {
      const payload = role === "farmer" ? farmerData : clientData;
      const res = await axios.post(`${SERVER_URL}/auth/register`, payload);

   
      if (res.data.token) {
        login(res.data.user, res.data.token);
        Alert.alert("Success", `Welcome, ${res.data.user.name}!`);
        onClose?.();
        if (res.data.user.role === "farmer") onNavigate?.("dashboard");
        else onNavigate?.("marketplace");
      }
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert("Error", "Registration failed");
    }


    //    try {
    //   const payload = role === "client" ? farmerData : clientData;
    //   const res = await axios.post(`${SERVER_URL}/auth/register`, payload);

   
    //   if (res.data.token) {
    //     login(res.data.user, res.data.token);
    //     Alert.alert("Success", `Welcome, ${res.data.user.name}!`);
    //     onClose?.();
    //     if (res.data.user.role === "client") onNavigate?.("dashboard");
    //     else onNavigate?.("marketplace");
    //   }
    // } catch (err) {
    //   console.log(err.response?.data || err.message);
    //   Alert.alert("Error", "Registration failed");
    // }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isRegister ? "Register" : "Login"}</Text>

      {isRegister && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={form.name}
            onChangeText={(text) => handleChange("name", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number" 
            keyboardType="phone-pad"
            value={form.phoneNumber} 
            onChangeText={(text) => handleChange("phoneNumber", text)} 
          />
          {role === "farmer" && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Farm Name"
                value={form.farmName}
                onChangeText={(text) => handleChange("farmName", text)}
              />
              <TextInput
                style={styles.input}
                placeholder="Farm Location"
                value={form.location}
                onChangeText={(text) => handleChange("location", text)}
              />
            </>
          )}
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(text) => handleChange("email", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange("password", text)}
      />

      {isRegister && (
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === "client" && styles.roleButtonActive]}
            onPress={() => setRole("client")}
          >
            <Text style={role === "client" ? styles.roleTextActive : styles.roleText}>
              Client
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, role === "farmer" && styles.roleButtonActive]}
            onPress={() => setRole("farmer")}
          >
            <Text style={role === "farmer" ? styles.roleTextActive : styles.roleText}>
              Farmer
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={isRegister ? handleRegister : handleLogin}
      >
        <Text style={styles.submitButtonText}>
          {isRegister ? "Register" : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsRegister(!isRegister)}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>
          {isRegister
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}



// style part

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: "#16A34A",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: { color: "#fff", fontWeight: "600" },
  switchButton: { marginTop: 12 },
  switchText: { color: "#16A34A" },
  closeButton: { marginTop: 20 },
  closeText: { color: "#EF4444" },
  roleContainer: { flexDirection: "row", marginVertical: 10 },
  roleButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  roleButtonActive: { backgroundColor: "#16A34A", borderColor: "#16A34A" },
  roleText: { color: "#374151" },
  roleTextActive: { color: "#fff", fontWeight: "600" },
});
