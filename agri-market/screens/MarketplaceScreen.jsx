import React, { useState, useEffect } from "react";
import { 
  View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert, Image 
} from "react-native";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import io from "socket.io-client";

const SERVER_URL = "http://localhost:3000";
const categories = ["All", "Vegetables", "Fruits", "Grains", "Herbs"];

export default function MarketplaceScreen({ onAuthRequired }) {
  const { user, token, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(SERVER_URL);
    setSocket(s);
    s.on("new-product", product => setProducts(prev => [product, ...prev]));
    return () => s.disconnect();
  }, []);

  const fetchProducts = async () => {
    if (!token) return;
    try {
      const endpoint = user?.role === "farmer" ? "/products/mine" : "/products/public";
      const res = await axios.get(`${SERVER_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status) setProducts(res.data.products);
    } catch (err) {
      Alert.alert("Error", "Could not fetch products");
    }
  };

  useEffect(() => { fetchProducts(); }, [user, token]);

  const filteredProducts = products.filter(
    p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "All" || p.category === selectedCategory)
  );

  if (!user) return (
    <View style={styles.centered}>
      <Text style={styles.title}>Welcome to AgriMarket </Text>
      <TouchableOpacity style={styles.button} onPress={onAuthRequired}>
        <Text style={styles.buttonText}>Login / Sign Up</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
        <Text style={styles.title}>Hello, {user.name}</Text>
        <TouchableOpacity onPress={logout}><Text style={{color:"#E11D48"}}>Logout</Text></TouchableOpacity>
      </View>

      <TextInput
        placeholder="Search..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.searchInput}
      />


      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedCategory(item)}
            style={[styles.catButton, selectedCategory === item && styles.catButtonActive]}
          >
            <Text style={selectedCategory === item ? styles.catTextActive : styles.catText}>{item}</Text>
          </TouchableOpacity>
        )}
        style={{ marginBottom: 10 }}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{ uri: item.image || "https://via.placeholder.com/150" }}
              style={styles.image}
            />
            <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
            <Text>{item.price} ETB / {item.unit}</Text>
            <Text>{item.farmer?.name} 📍 {item.farmer?.farmName}</Text>
            <TouchableOpacity style={{backgroundColor:"green",direction:"rtl",padding:0,color:"white",padding:"auto"}}>Buy Now</TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>No products found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex:1, justifyContent:"center", alignItems:"center" },
  title: { fontSize:20, fontWeight:"bold" },
  button: { backgroundColor:"#16A34A", padding:10, borderRadius:8 },
  buttonText: { color:"#fff", fontWeight:"600" },
  searchInput: { borderWidth:1, borderColor:"#ccc", borderRadius:8, padding:8, marginBottom:10 },
  catButton: { padding:8, marginRight:5, borderRadius:20, backgroundColor:"#eee" },
  catButtonActive: { backgroundColor:"#16A34A" },
  catText: { color:"#333" },
  catTextActive: { color:"#fff" },
  card: { borderWidth:1, borderColor:"#ccc", padding:10, borderRadius:8, marginBottom:10 },
  image: { width:"100%", height:150, marginBottom:5 },
});
