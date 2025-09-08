import React, { useState, useEffect } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, TextInput, Modal, Image, Alert, StyleSheet, ScrollView 
} from "react-native";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";

const SERVER_URL = "http://localhost:3000";

export default function DashboardScreen() {
  const { user, token, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalMoney, setTotalMoney] = useState(0);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "", price: "", quantity: "", unit: "kg", category: "Vegetables", description: ""
  });
  const [imageUri, setImageUri] = useState(null);

  const fetchProducts = async () => {
    if (!token) return;
    try {
      let res;
      if (user.role === "farmer") {

        res = await axios.get(`${SERVER_URL}/products/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {

        res = await axios.get(`${SERVER_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setProducts(res.data.products || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch products");
    }
  };

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      let res;
      if (user.role === "farmer") {

        res = await axios.get(`${SERVER_URL}/transactions/sales`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {

        res = await axios.get(`${SERVER_URL}/transactions/purchases`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      const tx = res.data.transactions || [];
      setTransactions(tx);
      const total = tx.reduce((sum, t) => sum + t.price * t.quantity, 0);
      setTotalMoney(total);
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert("Error", "Failed to fetch transactions");
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchProducts();
      fetchTransactions();
    }
  }, [user, token]);


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
      return Alert.alert("Error", "Please fill all required fields");
    }

    try {
      const formData = new FormData();
      Object.keys(newProduct).forEach(key => formData.append(key, newProduct[key]));
      if (imageUri) {
        const filename = imageUri.split("/").pop();
        const type = `image/${filename.split(".").pop()}`;
        formData.append("image", { uri: imageUri, name: filename, type });
      }

      const res = await axios.post(`${SERVER_URL}/products`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });

      setProducts([res.data.product, ...products]);
      setShowAddProductModal(false);
      setNewProduct({ name: "", price: "", quantity: "", unit: "kg", category: "Vegetables", description: "" });
      setImageUri(null);
      Alert.alert("Success", "Product added!");
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to add product");
    }
  };

  const handleBuyProduct = async (productId) => {
    try {
      await axios.post(`${SERVER_URL}/products/buy/${productId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert("Success", "Product bought!");
      fetchProducts();
      fetchTransactions();
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.message || "Failed to buy product");
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: "#fff" }}>
      <View style={styles.profileCard}>
        <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
        <Text style={styles.roleText}>Role: {user?.role}</Text>
        <Text>Email: {user?.email}</Text>
        <Text>Total Transactions: {transactions.length}</Text>
        <Text>Total Money {user.role === "farmer" ? "Earned" : "Spent"}: {totalMoney} ETB</Text>
        {/* <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Logout</Text>
        </TouchableOpacity> */}

         <TouchableOpacity style={styles.logoutBtn} onPress={logout}><Text style={{color:"#f7eef0ff"}}>Logout</Text></TouchableOpacity>
      </View>

      {user.role === "farmer" && (
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddProductModal(true)}>
          <Text style={{ color: "#fff" }}>Add Product +</Text>
        </TouchableOpacity>
      )}


      <FlatList
        data={products}
        keyExtractor={item => item._id}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No products yet</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image && <Image source={{ uri: `${SERVER_URL}${item.image}` }} style={styles.productImage} />}
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>{item.name}</Text>
            <Text>{item.price} ETB • {item.quantity} {item.unit}</Text>
            {item.category && <Text>Category: {item.category}</Text>}

            {user.role === "client" && item.sellerId !== user._id && (
              <TouchableOpacity 
                onPress={() => handleBuyProduct(item._id)}
                style={{ backgroundColor: "#047857", padding: 8, borderRadius: 6, marginTop: 8 }}
              >
                <Text style={{ color: "#fff" }}>Buy</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <Modal visible={showAddProductModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            {["name","price","quantity","unit","category","description"].map(f => (
              <TextInput
                key={f}
                placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                style={styles.input}
                value={newProduct[f]}
                onChangeText={t => setNewProduct({ ...newProduct, [f]: t })}
                keyboardType={["price","quantity"].includes(f) ? "numeric" : "default"}
              />
            ))}

            <TouchableOpacity onPress={pickImage} style={{ marginBottom: 8 }}>
              <Text style={{ color: "#047857" }}>
                {imageUri ? "Change Image" : "Pick Image 📷"}
              </Text>
            </TouchableOpacity>

            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{ width: "100%", height: 150, borderRadius: 6, marginBottom: 12 }}
              />
            )}

            <TouchableOpacity style={styles.modalBtn} onPress={handleAddProduct}>
              <Text style={{ color: "#fff" }}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalBtn, { backgroundColor: "#ccc", marginTop: 8 }]} 
              onPress={() => setShowAddProductModal(false)}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
    backgroundColor: "#F3F4F6"
  },
  welcomeText: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  roleText: { fontSize: 16, marginBottom: 4 },
  logoutBtn: {
    backgroundColor: "#EF4444",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "50%",
    marginTop: 8
  },
  addBtn: { backgroundColor: "#16A34A", padding: 10, borderRadius: 8, marginBottom: 16, alignItems: "center" },
  card: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8, marginBottom: 12 },
  productImage: { width: "100%", height: 150, marginBottom: 8, borderRadius: 6 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  modal: { backgroundColor: "#fff", borderRadius: 8, padding: 16 },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 6, padding: 10, marginBottom: 12 },
  modalBtn: { backgroundColor: "#16A34A", padding: 12, borderRadius: 8, alignItems: "center" },
});
