import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function ProdukScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [safeStock, setSafeStock] = useState('');
  const [unit, setUnit] = useState('pcs');

  const fetchData = async () => {
    setLoading(true);
    try {
      const catSnap = await getDocs(collection(db, 'categories'));
      const catData: any[] = [];
      catSnap.forEach(d => catData.push({ id: d.id, ...d.data() }));
      setCategories(catData);

      const itemSnap = await getDocs(collection(db, 'items'));
      const itemData: any[] = [];
      itemSnap.forEach(d => itemData.push({ id: d.id, ...d.data() }));
      setItems(itemData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setCategoryId(item.categoryId);
      setName(item.name);
      setSafeStock(String(item.safe_stock || ''));
      setUnit(item.unit || 'pcs');
    } else {
      setEditingId(null);
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setName('');
      setSafeStock('');
      setUnit('pcs');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !categoryId) return;
    try {
      const payload = {
        categoryId,
        name,
        safe_stock: safeStock,
        unit
      };

      if (editingId) {
        await updateDoc(doc(db, 'items', editingId), payload);
      } else {
        const newId = `item_${Date.now()}`;
        await setDoc(doc(db, 'items', newId), { id: newId, ...payload });
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error(error);
      if(typeof window !== 'undefined') alert('Gagal menyimpan');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = typeof window !== 'undefined' 
      ? window.confirm('Hapus produk ini?')
      : true;

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'items', id));
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.pageTitle}>Master Data Produk</Text>
          <Text style={styles.pageSubtitle}>Kelola stok dan data barang.</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()}>
          <Text style={styles.addButtonText}>+ Tambah Produk</Text>
        </TouchableOpacity>
      </View>
      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari produk..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Table Area */}
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <Text>Memuat data...</Text>
        ) : Platform.OS === 'web' ? (
          <View style={styles.webTableContainer}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, {width: 150}, styles.stickyLeft]}>Kategori</Text>
                <Text style={[styles.headerCell, {width: 250}, styles.stickyLeft, {left: 150}]}>Nama Produk</Text>
                <Text style={[styles.headerCell, {width: 100, textAlign: 'center'}]}>Stok Aman</Text>
                <Text style={[styles.headerCell, {width: 100, textAlign: 'center'}]}>Satuan</Text>
                <Text style={[styles.headerCell, {width: 150, textAlign: 'center'}]}>Aksi</Text>
              </View>
              {items
                .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.cell, {width: 150}, styles.stickyLeftItem]}>{getCategoryName(item.categoryId)}</Text>
                  <Text style={[styles.cell, {width: 250, fontFamily: 'Poppins_600SemiBold'}, styles.stickyLeftItem, {left: 150}]}>{item.name}</Text>
                  <Text style={[styles.cell, {width: 100, textAlign: 'center'}]}>{item.safe_stock}</Text>
                  <Text style={[styles.cell, {width: 100, textAlign: 'center'}]}>{item.unit}</Text>
                  <View style={{width: 150, flexDirection: 'row', justifyContent: 'center', gap: 12}}>
                  <TouchableOpacity onPress={() => handleOpenModal(item)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
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
                  <Text style={[styles.headerCell, {width: 150}, styles.stickyLeft]}>Kategori</Text>
                  <Text style={[styles.headerCell, {width: 250}, styles.stickyLeft, {left: 150}]}>Nama Produk</Text>
                  <Text style={[styles.headerCell, {width: 100, textAlign: 'center'}]}>Stok Aman</Text>
                  <Text style={[styles.headerCell, {width: 100, textAlign: 'center'}]}>Satuan</Text>
                  <Text style={[styles.headerCell, {width: 150, textAlign: 'center'}]}>Aksi</Text>
                </View>
              {items
                .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.cell, {width: 150}, styles.stickyLeftItem]}>{getCategoryName(item.categoryId)}</Text>
                  <Text style={[styles.cell, {width: 250, fontFamily: 'Poppins_600SemiBold'}, styles.stickyLeftItem, {left: 150}]}>{item.name}</Text>
                  <Text style={[styles.cell, {width: 100, textAlign: 'center'}]}>{item.safe_stock}</Text>
                  <Text style={[styles.cell, {width: 100, textAlign: 'center'}]}>{item.unit}</Text>
                  <View style={{width: 150, flexDirection: 'row', justifyContent: 'center', gap: 12}}>
                  <TouchableOpacity onPress={() => handleOpenModal(item)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
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
            <Text style={styles.modalTitle}>{editingId ? 'Edit Produk' : 'Tambah Produk'}</Text>
            
            <Text style={styles.label}>Pilih Kategori</Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16}}>
              {categories.map(cat => (
                <TouchableOpacity 
                  key={cat.id} 
                  style={[styles.catBadge, categoryId === cat.id && styles.catBadgeActive]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text style={[styles.catBadgeText, categoryId === cat.id && {color: '#FFF'}]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Nama Produk</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Contoh: Kopi Susu"
            />

            <View style={{flexDirection: 'row', gap: 12}}>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Stok Aman</Text>
                <TextInput
                  style={styles.input}
                  value={safeStock}
                  onChangeText={setSafeStock}
                  placeholder="Contoh: 10"
                  keyboardType="numeric"
                />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Satuan</Text>
                <TextInput
                  style={styles.input}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="Contoh: pcs"
                />
              </View>
            </View>

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
  searchInput: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', backgroundColor: '#FFFFFF', marginBottom: 16, fontSize: 14, color: '#0F172A' },
  content: { padding: 32, maxWidth: 1100, width: '100%', alignSelf: 'center' },
  webTableContainer: Platform.OS === 'web' ? {
    width: '100%',
    overflow: 'auto',
    maxHeight: 'calc(100vh - 250px)', // adjust based on padding/headers
    alignItems: 'flex-start',
  } as any : {},
  table: { 
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, overflow: 'hidden',
    ...(Platform.OS === 'web' ? { width: 'max-content', minWidth: 800 } as any : { minWidth: 800 }),
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
  modalContent: { backgroundColor: '#FFFFFF', padding: 32, borderRadius: 24, width: '100%', maxWidth: 480, shadowColor: '#000', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#0F172A', marginBottom: 24 },
  label: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#334155', marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', marginBottom: 20, fontSize: 15, backgroundColor: '#F8FAFC' },
  catBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F1F5F9', marginRight: 10 },
  catBadgeActive: { backgroundColor: '#4F46E5' },
  catBadgeText: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#64748B' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F1F5F9' },
  cancelBtnText: { fontFamily: 'Poppins_600SemiBold', color: '#475569' },
  saveBtn: { backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  saveBtnText: { fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' }
});
