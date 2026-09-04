import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearUser } = useAuthStore();
  const { width } = useWindowDimensions();

  // Breakpoint for mobile
  const isMobile = width < 768;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    } finally {
      clearUser();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      } else {
        router.replace('/');
      }
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/(dashboard)', icon: 'home-outline', roles: ['manager', 'logistik', 'barista'] },
    { label: 'Laporan', path: '/(dashboard)/laporan-shift', icon: 'document-text-outline', roles: ['manager', 'logistik', 'barista'] },
    { label: 'Kategori', path: '/(dashboard)/kategori', icon: 'list-outline', roles: ['manager'] },
    { label: 'Produk', path: '/(dashboard)/produk', icon: 'cube-outline', roles: ['manager'] },
  ];

  const visibleNavs = navItems.filter(nav => nav.roles.includes(user?.role || ''));

  return (
    <View style={styles.container}>
      {/* 
        DESKTOP SIDEBAR 
      */}
      {!isMobile && (
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <View style={styles.iconPlaceholder}>
              <Text style={styles.iconText}>LL</Text>
            </View>
            <Text style={styles.logoTitle}>Lupa Lelah</Text>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'GUEST'}</Text>
          </View>

          <View style={styles.navContainer}>
            {visibleNavs.map((nav, index) => {
              const isActive = pathname === nav.path;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => router.push(nav.path as any)}
                >
                  <Ionicons name={nav.icon as any} size={20} color={isActive ? '#4F46E5' : '#64748B'} style={{marginRight: 12}} />
                  <Text style={[styles.navText, isActive && styles.navTextActive]}>
                    {nav.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.sidebarFooter}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{marginRight: 8}} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 
        MOBILE TOP HEADER 
      */}
      {isMobile && (
        <View style={styles.mobileHeader}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={styles.mobileIconPlaceholder}>
              <Text style={styles.mobileIconText}>LL</Text>
            </View>
            <Text style={styles.mobileLogoTitle}>Lupa Lelah</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.mobileLogoutBtn}>
             <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* MAIN CONTENT AREA */}
      <View style={[styles.mainContent, isMobile && styles.mainContentMobile]}>
        <Slot />
      </View>

      {/* 
        MOBILE BOTTOM NAVIGATION 
      */}
      {isMobile && (
        <View style={styles.bottomNav}>
          {visibleNavs.map((nav, index) => {
            const isActive = pathname === nav.path;
            return (
              <TouchableOpacity
                key={index}
                style={styles.bottomNavItem}
                onPress={() => router.push(nav.path as any)}
              >
                <Ionicons 
                  name={nav.icon as any} 
                  size={24} 
                  color={isActive ? '#4F46E5' : '#94A3B8'} 
                  style={{marginBottom: 4}}
                />
                <Text style={[styles.bottomNavText, isActive && styles.bottomNavTextActive]}>
                  {nav.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // Default row, will be overridden for mobile visually
    backgroundColor: '#F1F5F9', 
  },
  sidebar: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingVertical: 32,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#4F46E5',
  },
  logoTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#0F172A',
    marginBottom: 4,
  },
  roleText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  navContainer: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  navItemActive: {
    backgroundColor: '#EEF2FF',
  },
  navText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#64748B',
  },
  navTextActive: {
    color: '#4F46E5',
    fontFamily: 'Poppins_600SemiBold',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoutText: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#EF4444',
    fontSize: 14,
  },
  mainContent: {
    flex: 1,
    overflow: 'hidden',
  },
  mainContentMobile: {
    paddingTop: 70,
    paddingBottom: 70,
  },
  
  // MOBILE STYLES
  mobileHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  mobileIconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mobileIconText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#4F46E5',
  },
  mobileLogoTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#0F172A',
  },
  mobileLogoutBtn: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10, // For iOS safe area
    zIndex: 10,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  bottomNavText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: '#94A3B8',
  },
  bottomNavTextActive: {
    color: '#4F46E5',
    fontFamily: 'Poppins_600SemiBold',
  }
});
