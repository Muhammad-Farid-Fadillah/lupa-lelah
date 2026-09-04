import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { DUMMY_CATEGORIES, DUMMY_ITEMS } from '../../data/inventory';
import { doc, setDoc, getDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
const SHIFTS = [1, 2, 3, 4];

export default function LaporanShiftScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const role = user?.role || 'unknown';

  const canEditIn = role === 'manager' || role === 'logistik';
  const canEditOut = role === 'manager' || role === 'barista';
  const canEditFinal = role === 'manager' || role === 'barista';
  const canEditPO = role === 'manager' || role === 'barista';

  // State untuk menyimpan nilai sel
  const [data, setData] = useState<any>({});
  const [categories, setCategories] = useState<any[]>(DUMMY_CATEGORIES);
  const [items, setItems] = useState<any[]>(DUMMY_ITEMS);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper untuk mendapatkan tanggal hari ini dalam format YYYY-MM-DD
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Master Data
        const catSnap = await getDocs(collection(db, 'categories'));
        const itemSnap = await getDocs(collection(db, 'items'));

        let fetchedCategories: any[] = [];
        let fetchedItems: any[] = [];

        if (catSnap.empty || itemSnap.empty) {
          // SEEDING: Push master data to Firestore
          const batch = writeBatch(db);
          
          DUMMY_CATEGORIES.forEach(cat => {
            batch.set(doc(db, 'categories', cat.id), cat);
          });
          
          DUMMY_ITEMS.forEach(item => {
            batch.set(doc(db, 'items', item.id), item);
          });
          
          await batch.commit();
          
          fetchedCategories = DUMMY_CATEGORIES;
          fetchedItems = DUMMY_ITEMS;
        } else {
          catSnap.forEach(d => fetchedCategories.push(d.data()));
          itemSnap.forEach(d => fetchedItems.push(d.data()));
          
          // Sort fetchedCategories by ID numeric part if needed, 
          // but for now just use it directly.
        }
        
        setCategories(fetchedCategories.length > 0 ? fetchedCategories : DUMMY_CATEGORIES);
        setItems(fetchedItems.length > 0 ? fetchedItems : DUMMY_ITEMS);

        // 2. Fetch Daily Records
        const todayStr = getTodayStr();
        const recordDoc = await getDoc(doc(db, 'daily_records', todayStr));
        if (recordDoc.exists()) {
          setData(recordDoc.data() || {});
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const todayStr = getTodayStr();
      await setDoc(doc(db, 'daily_records', todayStr), data);
      
      // Karena alert native tidak selalu jalan baik di web jika tidak di-handle,
      // kita gunakan console/alert biasa untuk simplifikasi.
      if (typeof window !== 'undefined') {
        window.alert('Data shift hari ini berhasil disimpan ke database!');
      } else {
        Alert.alert('Sukses', 'Data shift hari ini berhasil disimpan!');
      }
    } catch (error) {
      console.error("Error saving data:", error);
      if (typeof window !== 'undefined') {
        window.alert('Gagal menyimpan data.');
      } else {
        Alert.alert('Error', 'Gagal menyimpan data.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCellChange = (itemId: string, shift: number, field: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      [`${itemId}_s${shift}_${field}`]: value
    }));
  };

  const getCellValue = (itemId: string, shift: number, field: string) => {
    return data[`${itemId}_s${shift}_${field}`] || '';
  };

  const renderHeader = () => (
    <View style={styles.tableHeaderRow}>
      <View style={[styles.headerCell, styles.nameCol, styles.stickyLeftHeader]}>
        <Text style={styles.headerText}>NAMA BARANG</Text>
      </View>
      <View style={[styles.headerCell, styles.stockCol, styles.stickyLeftHeader, { left: 200 }]}>
        <Text style={styles.headerText}>STOK AMAN</Text>
      </View>
      <View style={[styles.headerCell, styles.unitCol, styles.stickyLeftHeader, { left: 280, borderRightWidth: 2 }]}>
        <Text style={styles.headerText}>SATUAN</Text>
      </View>
      {SHIFTS.map(shift => (
        <View key={shift} style={styles.shiftGroup}>
          <Text style={styles.shiftTitle}>Shift {shift}</Text>
          <View style={styles.shiftSubHeader}>
            <View style={styles.subHeaderCell}><Text style={styles.subHeaderText}>In</Text></View>
            <View style={styles.subHeaderCell}><Text style={styles.subHeaderText}>Out</Text></View>
            <View style={styles.subHeaderCell}><Text style={styles.subHeaderText}>Stok Akhir</Text></View>
            {(shift === 2 || shift === 3) && (
              <View style={styles.subHeaderCell}><Text style={styles.subHeaderText}>PO</Text></View>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderCategory = (category: any) => {
    const categoryItems = items.filter(item => item.categoryId === category.id);
    return (
      <View key={category.id}>
        {/* Category Header */}
        <View style={styles.categoryRow}>
          <View style={[styles.stickyLeftCol, { backgroundColor: '#E2E8F0', paddingVertical: 8, paddingHorizontal: 16 }]}>
            <Text style={styles.categoryText}>{category.name}</Text>
          </View>
        </View>
        
        {/* Items */}
        {categoryItems.map(item => (
          <View key={item.id} style={styles.itemRow}>
            <View style={[styles.cell, styles.nameCol, styles.stickyLeftCol]}>
              <Text style={styles.itemText}>{item.name}</Text>
            </View>
            <View style={[styles.cell, styles.stockCol, styles.stickyLeftCol, { left: 200 }]}>
              <Text style={styles.stockText}>{item.safe_stock}</Text>
            </View>
            <View style={[styles.cell, styles.unitCol, styles.stickyLeftCol, { left: 280, borderRightWidth: 2 }]}>
              <Text style={styles.unitText}>{item.unit}</Text>
            </View>
            {SHIFTS.map(shift => {
              const finalVal = getCellValue(item.id, shift, 'final');
              const finalNum = parseFloat(finalVal);
              const isLowStock = finalVal !== '' && !isNaN(finalNum) && finalNum < item.safe_stock;

              return (
              <View key={shift} style={styles.shiftCells}>
                <TextInput
                  style={[styles.inputCell, styles.inCell, !canEditIn && styles.disabledCell]}
                  value={getCellValue(item.id, shift, 'in')}
                  onChangeText={(val) => handleCellChange(item.id, shift, 'in', val)}
                  keyboardType="numeric"
                  editable={canEditIn}
                />
                <TextInput
                  style={[styles.inputCell, !canEditOut && styles.disabledCell]}
                  value={getCellValue(item.id, shift, 'out')}
                  onChangeText={(val) => handleCellChange(item.id, shift, 'out', val)}
                  keyboardType="numeric"
                  editable={canEditOut}
                />
                <TextInput
                  style={[
                    styles.inputCell, 
                    styles.finalCell, 
                    !canEditFinal && styles.disabledCell,
                    isLowStock && { color: '#DC2626', backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', fontWeight: 'bold' }
                  ]}
                  value={finalVal}
                  onChangeText={(val) => handleCellChange(item.id, shift, 'final', val)}
                  keyboardType="numeric"
                  editable={canEditFinal}
                />
                {(shift === 2 || shift === 3) && (
                  <TouchableOpacity 
                    style={styles.poCell}
                    onPress={() => canEditPO && handleCellChange(item.id, shift, 'po', getCellValue(item.id, shift, 'po') ? '' : 'checked')}
                    disabled={!canEditPO}
                  >
                    <View style={[
                      styles.checkbox, 
                      getCellValue(item.id, shift, 'po') ? styles.checkboxChecked : null,
                      !canEditPO && styles.disabledCheckbox
                    ]}>
                      {getCellValue(item.id, shift, 'po') ? <Ionicons name="checkmark" size={16} color={!canEditPO ? '#94A3B8' : '#FFF'} /> : null}
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )})}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.pageTitle}>Laporan Shift (Hari Ini)</Text>
          <Text style={styles.pageSubtitle}>Input data In, Out, dan Stok Akhir.</Text>
        </View>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && { backgroundColor: '#94A3B8' }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>{isSaving ? 'Menyimpan...' : 'Simpan Data'}</Text>
        </TouchableOpacity>
      </View>

      {/* Table Area */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Memuat data dari database...</Text>
        </View>
      ) : Platform.OS === 'web' ? (
        <View style={styles.tableWrapper}>
          <View style={styles.webTableContainer}>
            <View style={styles.table}>
              {renderHeader()}
              {categories.map(renderCategory)}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.tableWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.table}>
              <ScrollView 
                showsVerticalScrollIndicator={true} 
                stickyHeaderIndices={[0]}
              >
                {renderHeader()}
                {categories.map(renderCategory)}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 32, paddingTop: 32, paddingBottom: 16,
    flexWrap: 'wrap', gap: 16
  },
  pageTitle: {
    fontFamily: 'Poppins_700Bold',
    color: '#0F172A',
    fontSize: 24,
    marginBottom: 4,
  },
  pageSubtitle: { 
    fontFamily: 'Poppins_400Regular', 
    color: '#64748B', 
    fontSize: 14 
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#4F46E5', 
    shadowOffset: {width: 0, height: 4}, 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    elevation: 4
  },
  saveButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#64748B',
  },
  tableWrapper: {
    flex: 1,
    padding: 24,
  },
  webTableContainer: Platform.OS === 'web' ? {
    flex: 1,
    overflow: 'auto',
    maxHeight: 'calc(100vh - 200px)',
    alignItems: 'flex-start',
  } as any : {},
  table: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#475569',
    flexDirection: 'column',
    ...(Platform.OS === 'web' ? { width: 'max-content', minWidth: 1250 } as any : { minWidth: 1250 }),
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 2,
    borderBottomColor: '#475569',
    ...(Platform.OS === 'web' ? { position: 'sticky', top: 0, zIndex: 30 } as any : { zIndex: 10 }),
  },
  stickyLeftHeader: Platform.OS === 'web' ? {
    position: 'sticky',
    left: 0,
    zIndex: 40,
    backgroundColor: '#F1F5F9',
  } as any : {},
  stickyLeftCol: Platform.OS === 'web' ? {
    position: 'sticky',
    left: 0,
    zIndex: 20,
    backgroundColor: '#FFFFFF',
  } as any : {},
  headerCell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#94A3B8',
    padding: 8,
  },
  nameCol: {
    width: 200,
  },
  stockCol: {
    width: 80,
  },
  unitCol: {
    width: 80,
  },
  headerText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#1E293B',
    textAlign: 'center',
  },
  shiftGroup: {
    borderRightWidth: 2,
    borderRightColor: '#475569',
  },
  shiftTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#94A3B8',
    backgroundColor: '#E2E8F0',
  },
  shiftSubHeader: {
    flexDirection: 'row',
  },
  subHeaderCell: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  subHeaderText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#334155',
  },
  categoryRow: {
    backgroundColor: '#E2E8F0',
    borderBottomWidth: 2,
    borderBottomColor: '#475569',
  },
  categoryText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: 2,
  },
  itemRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#94A3B8',
  },
  cell: {
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRightWidth: 1,
    borderRightColor: '#94A3B8',
  },
  itemText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#334155',
  },
  stockText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#1E293B',
    textAlign: 'center',
  },
  unitText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  shiftCells: {
    flexDirection: 'row',
    borderRightWidth: 2,
    borderRightColor: '#475569',
  },
  inputCell: {
    width: 60,
    height: 36,
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
    color: '#0F172A',
  },
  inCell: {
    backgroundColor: '#F0FDF4', // Light green hint
  },
  finalCell: {
    backgroundColor: '#EFF6FF', // Light blue hint
  },
  poCell: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#94A3B8',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  disabledCell: {
    backgroundColor: '#F1F5F9',
    color: '#94A3B8',
  },
  disabledCheckbox: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  }
});
