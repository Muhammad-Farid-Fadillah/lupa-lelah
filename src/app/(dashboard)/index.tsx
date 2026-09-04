import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Welcome Banner */}
        <View style={[styles.welcomeBanner, isMobile && { padding: 24 }]}>
          <View style={styles.welcomeTextContainer}>
            <Text style={[styles.welcomeTitle, isMobile && { fontSize: 24 }]}>
              Halo{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
            </Text>
            <Text style={[styles.welcomeSubtitle, isMobile && { fontSize: 14 }]}>
              Selamat datang di Lupa Lelah Dashboard. Gunakan menu di sidebar untuk mulai mengelola data.
            </Text>
          </View>
        </View>

        {/* Quick Stats / Info Cards */}
        <View style={[styles.statsGrid, isMobile && { flexDirection: 'column' }]}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Status Peran</Text>
            <Text style={styles.statValue}>{user?.role?.toUpperCase() || 'GUEST'}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Shift Terkini</Text>
            <Text style={styles.statValue}>Aktif</Text>
          </View>
        </View>

        {/* Quick Actions (Shortcut) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(dashboard)/laporan-shift')}
          >
            <View style={[styles.actionIcon, {backgroundColor: '#EEF2FF'}]}>
              <Text style={{fontSize: 20}}>📝</Text>
            </View>
            <View>
              <Text style={styles.actionTitle}>Isi Laporan Shift</Text>
              <Text style={styles.actionDesc}>Input data In, Out & Stok Akhir.</Text>
            </View>
          </TouchableOpacity>

          {user?.role === 'manager' && (
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(dashboard)/produk')}
            >
              <View style={[styles.actionIcon, {backgroundColor: '#ECFDF5'}]}>
                <Text style={{fontSize: 20}}>📦</Text>
              </View>
              <View>
                <Text style={styles.actionTitle}>Kelola Produk</Text>
                <Text style={styles.actionDesc}>Update master data barang.</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 32,
    paddingBottom: 64,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  welcomeBanner: {
    backgroundColor: '#4F46E5', // Indigo 600
    borderRadius: 24,
    padding: 40,
    marginBottom: 32,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  welcomeTextContainer: {
    maxWidth: 600,
  },
  welcomeTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#E0E7FF', // Indigo 100
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  statValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#0F172A',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#1E293B',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  actionCard: {
    flex: 1,
    minWidth: 300,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 4,
  },
  actionDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#64748B',
  }
});
