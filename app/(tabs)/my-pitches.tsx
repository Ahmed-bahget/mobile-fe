import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiService } from '@/services/api';
import { Pitch } from '@/types/api';
import { Plus, MapPin, DollarSign, CreditCard as Edit } from 'lucide-react-native';

export default function MyPitchesScreen() {
  const router = useRouter();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPitches();
  }, []);

  const loadPitches = async () => {
    try {
      setError(null);
      const data = await apiService.getMyPitches();
      setPitches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pitches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPitches();
  };

  const handleToggleStatus = async (pitch: Pitch) => {
    try {
      await apiService.togglePitchStatus(pitch.id, !pitch.isActive);
      loadPitches();
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to update pitch status'
      );
    }
  };

  const renderPitchItem = ({ item }: { item: Pitch }) => (
    <View style={styles.pitchCard}>
      <View style={styles.pitchContent}>
        {item.images && item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.pitchImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <View style={styles.pitchInfo}>
          <View style={styles.pitchHeader}>
            <Text style={styles.pitchName} numberOfLines={1}>
              {item.name}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push(`/pitch/edit/${item.id}`)}
            >
              <Edit size={18} color="#10b981" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <MapPin size={14} color="#6b7280" />
            <Text style={styles.location} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <DollarSign size={14} color="#10b981" />
            <Text style={styles.price}>{item.pricePerHour}/hour</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Active</Text>
            <Switch
              value={item.isActive}
              onValueChange={() => handleToggleStatus(item)}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={item.isActive ? '#10b981' : '#f3f4f6'}
            />
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPitches}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pitches}
        renderItem={renderPitchItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pitches yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first pitch to get started
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#10b981"
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/pitch/create')}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  pitchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pitchContent: {
    flexDirection: 'row',
  },
  pitchImage: {
    width: 120,
    height: 140,
    backgroundColor: '#e5e7eb',
  },
  placeholderImage: {
    width: 120,
    height: 140,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  pitchInfo: {
    flex: 1,
    padding: 12,
  },
  pitchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pitchName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  editButton: {
    padding: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  location: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
    flex: 1,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 6,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
