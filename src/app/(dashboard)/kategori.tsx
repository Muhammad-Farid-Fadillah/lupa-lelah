import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function KategoriScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'categories'));
      const data: any[] = [];
      snap.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat?: any) => {
    if (cat) {
      setEditingId(cat.id);
      setCatName(cat.name);
    } else {
      setEditingId(null);
      setCatName('');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!catName.trim()) return;
    try {
      if (editingId) {
        // Update
        await updateDoc(doc(db, 'categories', editingId), { name: catName });
      } else {
        // Create (with custom cat_ ID logic or auto-gen)
        const newId = `cat_${Date.now()}`;
        await setDoc(doc(db, 'categories', newId), { id: newId, name: catName });
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      if(typeof window !== 'undefined') alert('Gagal menyimpan');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = typeof window !== 'undefined' 
      ? window.confirm('Hapus kategori ini?')
      : true; // In native, use Alert.alert

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'categories', id));
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.pageTitle}>Kelola Kategori</Text>
          <Text style={styles.pageSubtitle}>Tambah, ubah, atau hapus kategori produk.</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()}>
          <Text style={styles.addButtonText}>+ Tambah Kategori</Text>
        </TouchableOpacity>
      </View>

      {/* Table Area */}
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <Text>Memuat data...</Text>
        ) : Platform.OS === 'web' ? (
          <View style={styles.webTableContainer}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, {width: 50}, styles.stickyLeft]}>ID</Text>
                <Text style={[styles.headerCell, {width: 200}, styles.stickyLeft, {left: 50}]}>Nama Kategori</Text>
                <Text style={[styles.headerCell, {width: 150, textAlign: 'center'}]}>Aksi</Text>
              </View>
              {categories.map((cat, index) => (
                <View key={cat.id} style={styles.tableRow}>
                  <Text style={[styles.cell, {width: 50}, styles.stickyLeftItem]}>{cat.id}</Text>
                  <Text style={[styles.cell, {width: 200, fontFamily: 'Poppins_600SemiBold'}, styles.stickyLeftItem, {left: 50}]}>{cat.name}</Text>
                  <View style={{width: 150, flexDirection: 'row', justifyContent: 'center', gap: 12}}>
                  <TouchableOpacity onPress={() => handleOpenModal(cat)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(cat.id)}>
                    <Text style={styles.deleteText}>Hapus</Text>
                  </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <ScrollView showsVerticalScrollIndicator={true} stickyHeaderIndices={[0]}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, {width: 50}, styles.stickyLeft]}>ID</Text>
                  <Text style={[styles.headerCell, {width: 200}, styles.stickyLeft, {left: 50}]}>Nama Kategori</Text>
                  <Text style={[styles.headerCell, {width: 150, textAlign: 'center'}]}>Aksi</Text>
                </View>
              {categories.map((cat, index) => (
                <View key={cat.id} style={styles.tableRow}>
                  <Text style={[styles.cell, {width: 50}, styles.stickyLeftItem]}>{cat.id}</Text>
                  <Text style={[styles.cell, {width: 200, fontFamily: 'Poppins_600SemiBold'}, styles.stickyLeftItem, {left: 50}]}>{cat.name}</Text>
                  <View style={{width: 150, flexDirection: 'row', justifyContent: 'center', gap: 12}}>
                  <TouchableOpacity onPress={() => handleOpenModal(cat)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(cat.id)}>
                    <Text style={styles.deleteText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
                </View>
              ))}
              </ScrollView>
            </View>
          </ScrollView>
        )}
      </ScrollView>

      {/* Modal Form */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</Text>
            <Text style={styles.label}>Nama Kategori</Text>
            <TextInput
              style={styles.input}
              value={catName}
              onChangeText={setCatName}
              placeholder="Contoh: SNACKS"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 32, paddingTop: 32, paddingBottom: 16,
    flexWrap: 'wrap', gap: 16
  },
  pageTitle: { fontFamily: 'Poppins_700Bold', color: '#0F172A', fontSize: 24, marginBottom: 4 },
  pageSubtitle: { fontFamily: 'Poppins_400Regular', color: '#64748B', fontSize: 14 },
  addButton: { backgroundColor: '#4F46E5', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, shadowColor: '#4F46E5', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  addButtonText: { fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF', fontSize: 14 },
  content: { padding: 32, maxWidth: 900, width: '100%', alignSelf: 'center' },
  webTableContainer: Platform.OS === 'web' ? {
    width: '100%',
    overflow: 'auto',
    maxHeight: 'calc(100vh - 250px)', // adjust based on padding/headers
    alignItems: 'flex-start',
  } as any : {},
  table: { 
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, overflow: 'hidden',
    ...(Platform.OS === 'web' ? { width: 'max-content', minWidth: 450 } as any : { minWidth: 450 }),
  },
  tableHeader: { 
    flexDirection: 'row', backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', padding: 16,
    ...(Platform.OS === 'web' ? { position: 'sticky', top: 0, zIndex: 30 } as any : { zIndex: 10 })
  },
  headerCell: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#475569', textTransform: 'uppercase' },
  stickyLeft: Platform.OS === 'web' ? {
    position: 'sticky', left: 0, zIndex: 40, backgroundColor: '#F8FAFC',
  } as any : {},
  stickyLeftItem: Platform.OS === 'web' ? {
    position: 'sticky', left: 0, zIndex: 20, backgroundColor: '#FFFFFF',
  } as any : {},
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', padding: 16, alignItems: 'center' },
  cell: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#1E293B' },
  editText: { color: '#4F46E5', fontFamily: 'Poppins_600SemiBold', backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteText: { color: '#DC2626', fontFamily: 'Poppins_600SemiBold', backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', padding: 32, borderRadius: 24, width: '100%', maxWidth: 440, shadowColor: '#000', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#0F172A', marginBottom: 24 },
  label: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#334155', marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', marginBottom: 24, fontSize: 15, backgroundColor: '#F8FAFC' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F1F5F9' },
  cancelBtnText: { fontFamily: 'Poppins_600SemiBold', color: '#475569' },
  saveBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  saveBtnText: { fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' }
});
