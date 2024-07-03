import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskToUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [task, setTask] = useState("");
  const [assignedTasks, setAssignedTasks] = useState([]);
  
  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error("Error fetching token", error);
    }
  };

  const getAllUsersData = async () => {
    try {
      const token = await getToken();
      const response = await fetch("http://192.168.0.238:3000/admin/taskToUser", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsersData();
    fetchAssignedTasks();
  }, []);

  const handleSubmit = async () => {
    try {
      const token = await getToken();
      const response = await fetch("http://192.168.0.238:3000/assignTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          userId: selectedUser,
          task: task,
        }),
      });

      if (response.ok) {
        console.log("Task assigned successfully!");
        Alert.alert("Success", "Task assigned successfully!");
         // Clear input fields
         setSelectedUser("");
         setTask("");
        fetchAssignedTasks();
      } else {
        console.error("Error assigning task:", response.statusText);
      }
    } catch (error) {
      console.error("Error assigning task:", error.message);
    }
  };

  const fetchAssignedTasks = async () => {
    try {
      const token = await getToken();
      const response = await fetch("http://192.168.0.238:3000/admin/tasks", {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });
      const data = await response.json();
      setAssignedTasks(data);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = await getToken();
      const response = await fetch(
        `http://192.168.0.238:3000/admin/tasks/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        }
      );
      if (response.ok) {
        setAssignedTasks((prevTasks) =>
          prevTasks.filter((task) => task._id !== id)
        );
      } else {
        console.error("Failed to delete task");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Task To User</Text>
      <View style={styles.form}>
        <Text>Select User:</Text>
        <Picker
          selectedValue={selectedUser}
          onValueChange={(itemValue) => setSelectedUser(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select User" value="" />
          {users.map((userData, index) => (
            <Picker.Item key={index} label={userData.email} value={userData._id} />
          ))}
        </Picker>
        <Text>Task:</Text>
        <TextInput
          style={styles.input}
          value={task}
          onChangeText={setTask}
          placeholder="Enter task"
        />
        <Button title="Assign Task" onPress={handleSubmit} />
      </View>
      <FlatList
        data={assignedTasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text>Task: {item.task}</Text>
            <Text>Assigned To: {item.assignedTo ? item.assignedTo.name : "N/A"}</Text>
            <Text>Status: {item.status}</Text>
            <TouchableOpacity onPress={() => deleteTask(item._id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  form: {
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
  },
  taskItem: {
    padding: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  deleteButton: {
    color: 'red',
    marginTop: 10,
  },
});

export default TaskToUsers;
