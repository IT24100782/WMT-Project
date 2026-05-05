import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Platform, Linking, Modal, KeyboardAvoidingView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatTimeAgo } from '../utils/timeUtils';
import { ResourceContext } from '../context/ResourceContext';

export default function ResourcesScreen() {
  const router = useRouter();
  const resourceContext = useContext(ResourceContext);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  
  // Form State
  const [titleInput, setTitleInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');

  useEffect(() => {
    const enforceLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/');
      } else {
        setIsAuthenticated(true);
      }
    };
    enforceLogin();
  }, [router]);

  if (!isAuthenticated || !resourceContext) {
    return null;
  }

  const { resources, addResource, updateResource, deleteResource, isLoading } = resourceContext;

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getIconForType = (link: string) => {
    if (!link) return 'link';
    const lowerLink = link.toLowerCase();
    if (lowerLink.includes('.pdf')) return 'picture-as-pdf';
    if (lowerLink.includes('youtube.com') || lowerLink.includes('vimeo.com') || lowerLink.includes('.mp4')) return 'play-circle-outline';
    if (lowerLink.includes('medium.com') || lowerLink.includes('blog')) return 'article';
    return 'link';
  };

  const getColorForType = (link: string) => {
    if (!link) return '#757777';
    const lowerLink = link.toLowerCase();
    if (lowerLink.includes('.pdf')) return '#ef4444'; // Red
    if (lowerLink.includes('youtube.com') || lowerLink.includes('vimeo.com') || lowerLink.includes('.mp4')) return '#3b82f6'; // Blue
    if (lowerLink.includes('medium.com') || lowerLink.includes('blog')) return '#a3e635'; // Green
    return '#fdd34d'; // Yellow
  };

  const handleOpenAddModal = () => {
    setEditingResourceId(null);
    setTitleInput('');
    setLinkInput('');
    setDescriptionInput('');
    setModalVisible(true);
  };

  const handleOpenEditModal = (id: string, title: string, link: string, description: string) => {
    setEditingResourceId(id);
    setTitleInput(title);
    setLinkInput(link);
    setDescriptionInput(description);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!titleInput.trim() || !linkInput.trim()) {
      Alert.alert("Error", "Please fill in the Title and Link fields.");
      return;
    }

    let success = false;
    if (editingResourceId) {
      success = await updateResource(editingResourceId, titleInput, linkInput, descriptionInput);
    } else {
      success = await addResource(titleInput, linkInput, descriptionInput);
    }

    if (success) {
      setModalVisible(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Resource", 
      "Are you sure you want to delete this resource?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteResource(id) }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#2d2f2f" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>RESOURCES</Text>
        <TouchableOpacity onPress={handleOpenAddModal}>
           <MaterialIcons name="add" size={28} color="#2d2f2f" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#757777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search resources..."
          placeholderTextColor="#9c9d9d"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.greetingText}>Study Materials</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleOpenAddModal}>
            <MaterialIcons name="add" size={20} color="#f5f2f1" style={{ marginRight: 8 }} />
            <Text style={styles.addButtonText}>Add New Resource</Text>
          </TouchableOpacity>
        </View>

        {isLoading && resources.length === 0 ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : filteredResources.length === 0 ? (
          <Text style={styles.emptyText}>No resources found.</Text>
        ) : (
          filteredResources.map((res) => (
            <View key={res._id} style={styles.resourceCard}>
              <View style={[styles.colorBorder, { backgroundColor: getColorForType(res.link) }]} />
              
              <View style={styles.resourceHeader}>
                <View style={styles.resourceHeaderLeft}>
                  <View style={[styles.iconWrapper, { backgroundColor: getColorForType(res.link) + '20' }]}>
                    <MaterialIcons name={getIconForType(res.link)} size={24} color={getColorForType(res.link)} />
                  </View>
                </View>
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity onPress={() => handleOpenEditModal(res._id, res.title, res.link, res.description || '')} style={styles.actionIconButton}>
                    <MaterialIcons name="edit" size={20} color="#5c5b5b" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(res._id)} style={styles.actionIconButton}>
                    <MaterialIcons name="delete" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.resourceTitle} numberOfLines={2}>{res.title}</Text>
              <Text style={styles.resourceDescription} numberOfLines={2}>{res.description}</Text>

              <View style={styles.resourceFooter}>
                <Text style={styles.timeText}>{formatTimeAgo(res.updatedAt)}</Text>
                <TouchableOpacity 
                   style={styles.openBtn}
                   onPress={() => {
                      Linking.openURL(res.link).catch(err => console.log('Error opening link:', err));
                   }}
                >
                  <Text style={styles.openBtnText}>OPEN</Text>
                  <MaterialIcons name="open-in-new" size={14} color="#2d2f2f" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', alignItems: 'center' }}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingResourceId ? 'Edit Resource' : 'Add New Resource'}</Text>
              
              <Text style={styles.inputLabel}>TITLE</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Calculus Cheatsheet"
                placeholderTextColor="#9c9d9d"
                value={titleInput}
                onChangeText={setTitleInput}
              />
              
              <Text style={styles.inputLabel}>LINK</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. https://example.com/pdf"
                placeholderTextColor="#9c9d9d"
                value={linkInput}
                onChangeText={setLinkInput}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>DESCRIPTION</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write a brief description..."
                placeholderTextColor="#9c9d9d"
                value={descriptionInput}
                onChangeText={setDescriptionInput}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleSubmit}>
                  <Text style={styles.modalSubmitBtnText}>{editingResourceId ? 'Save' : 'Add'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f2f1',
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 16,
    backgroundColor: '#fdd34d',
  },
  appBarTitle: {
    fontWeight: '900',
    fontSize: 16,
    color: '#2d2f2f',
    letterSpacing: 1,
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#2d2f2f',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerSection: {
    flexDirection: 'column',
    marginBottom: 24,
    marginTop: 8,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2d2f2f',
    lineHeight: 32,
    letterSpacing: -1,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#2d2f2f',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  addButtonText: {
    color: '#fdd34d',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#757777',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 40,
  },
  resourceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  colorBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resourceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#f5f2f1',
    borderRadius: 16,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2d2f2f',
    marginBottom: 8,
    lineHeight: 24,
  },
  resourceDescription: {
    fontSize: 13,
    color: '#5c5b5b',
    fontWeight: '500',
    marginBottom: 20,
    lineHeight: 18,
  },
  resourceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#757777',
    fontWeight: '700',
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdd34d',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  openBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2d2f2f',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2d2f2f',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2d2f2f',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#f0f1f1',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 20,
    fontSize: 15,
    fontWeight: '600',
    color: '#2d2f2f',
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#f0f1f1',
  },
  modalCancelBtnText: {
    color: '#757777',
    fontWeight: '800',
    fontSize: 14,
  },
  modalSubmitBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#fdd34d',
  },
  modalSubmitBtnText: {
    color: '#2d2f2f',
    fontWeight: '900',
    fontSize: 14,
  }
});
