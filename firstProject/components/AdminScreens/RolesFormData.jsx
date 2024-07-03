import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, StyleSheet, ScrollView, Linking, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import axios from "axios";

const RoleFormData = () => {
  const [formData, setFormData] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const openInMap = (latitude, longitude) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const response = await axios.get("http://192.168.0.238:3000/admin/rolesFormData");
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching form data:", error);
    }
  };

  const openImageModal = (imageUri) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.roleCell]}>{item.role}</Text>
      <Text style={[styles.cell, styles.submittedAtCell]}>{new Date(item.submitedAt).toLocaleString()}</Text>
      <ScrollView horizontal style={[styles.cell, styles.formDataCell]}>
        <Text style={styles.jsonText}>{JSON.stringify(item.formData, null, 2)}</Text>
      </ScrollView>
      <View style={[styles.cell, styles.mapCell]}>
        {item.formData.latitude && item.formData.longitude && (
          <TouchableOpacity style={styles.mapLink} onPress={() => openInMap(item.formData.latitude, item.formData.longitude)}>
            <Text style={styles.mapLinkText}>Open in Map</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.cell, styles.imageCell]}>
        {item.formData.photo && (
          <TouchableOpacity onPress={() => openImageModal(`http://192.168.0.238:3000/${item.formData.photo}`)}>
            <Image style={styles.image} source={{ uri: `http://192.168.0.238:3000/${item.formData.photo}` }} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.roleHeader]}>Role</Text>
            <Text style={[styles.headerCell, styles.submittedAtHeader]}>Submitted At</Text>
            <Text style={[styles.headerCell, styles.formDataHeader]}>Form Data</Text>
            <Text style={[styles.headerCell, styles.mapHeader]}>Map</Text>
            <Text style={[styles.headerCell, styles.imageHeader]}>Uploaded Image</Text>
          </View>
          <FlatList
            data={formData}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </ScrollView>

      <Modal visible={isModalVisible} transparent={true}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalContainer}>
            <Image style={styles.fullScreenImage} source={{ uri: selectedImage }} />
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    backgroundColor: '#e9ecef',
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#495057',
    paddingVertical: 10,
    textAlign: 'center',
  },
  roleHeader: {
    width: 100,
  },
  submittedAtHeader: {
    width: 200,
  },
  formDataHeader: {
    width: 300,
  },
  mapHeader: {
    width: 100,
  },
  imageHeader: {
    width: 150,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ced4da',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  cell: {
    textAlign: 'center',
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: '#ced4da',
  },
  roleCell: {
    width: 100,
  },
  submittedAtCell: {
    width: 200,
  },
  formDataCell: {
    width: 300,
  },
  mapCell: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCell: {
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jsonText: {
    fontFamily: 'monospace',
    color: '#212529',
  },
  image: {
    height: 70,
    width: 70,
    resizeMode: 'contain',
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  mapLink: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  mapLinkText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default RoleFormData;
