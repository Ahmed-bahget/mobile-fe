import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiService } from '@/services/api';
import { Pitch, TimeSlot } from '@/types/api';
import { MapPin, DollarSign, Calendar, Clock, CircleCheck as CheckCircle } from 'lucide-react-native';

export default function PitchDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPitchDetails();
  }, [id]);

  useEffect(() => {
    if (pitch) {
      loadAvailableSlots();
    }
  }, [selectedDate, pitch]);

  const loadPitchDetails = async () => {
    try {
      setError(null);
      const data = await apiService.getPitch(id as string);
      setPitch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pitch');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const data = await apiService.getAvailableSlots(
        id as string,
        selectedDate
      );
      setSlots(data);
    } catch (err) {
      console.error('Failed to load slots:', err);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    setBooking(true);

    try {
      await apiService.createBooking({
        pitchId: id as string,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      Alert.alert('Success', 'Booking confirmed!', [
        { text: 'OK', onPress: () => router.push('/(tabs)/bookings') },
      ]);
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Booking failed'
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (error || !pitch) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Pitch not found'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {pitch.images && pitch.images.length > 0 ? (
          <Image source={{ uri: pitch.images[0] }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.name}>{pitch.name}</Text>

          <View style={styles.detailRow}>
            <MapPin size={20} color="#6b7280" />
            <Text style={styles.location}>{pitch.location}</Text>
          </View>

          <View style={styles.detailRow}>
            <DollarSign size={20} color="#10b981" />
            <Text style={styles.price}>{pitch.pricePerHour}/hour</Text>
          </View>

          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{pitch.size}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{pitch.surface}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{pitch.description}</Text>

          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.description}>{pitch.address}</Text>

          {pitch.amenities && pitch.amenities.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesList}>
                {pitch.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <CheckCircle size={16} color="#10b981" />
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          <Text style={styles.dateText}>Date: {selectedDate}</Text>

          <View style={styles.slotsContainer}>
            {slots.length === 0 ? (
              <Text style={styles.noSlotsText}>
                No available slots for this date
              </Text>
            ) : (
              slots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slotButton,
                    slot.isBooked && styles.slotButtonBooked,
                    selectedSlot?.id === slot.id && styles.slotButtonSelected,
                  ]}
                  onPress={() => !slot.isBooked && setSelectedSlot(slot)}
                  disabled={slot.isBooked}
                >
                  <Clock size={16} color={slot.isBooked ? '#9ca3af' : '#fff'} />
                  <Text
                    style={[
                      styles.slotText,
                      slot.isBooked && styles.slotTextBooked,
                    ]}
                  >
                    {slot.startTime} - {slot.endTime}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {selectedSlot && (
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerLabel}>Total</Text>
            <Text style={styles.footerPrice}>${selectedSlot.price}</Text>
          </View>
          <TouchableOpacity
            style={[styles.bookButton, booking && styles.bookButtonDisabled]}
            onPress={handleBooking}
            disabled={booking}
          >
            {booking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.bookButtonText}>Book Now</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#e5e7eb',
  },
  placeholderImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 8,
  },
  tags: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  amenitiesList: {
    gap: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#6b7280',
  },
  dateText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 100,
  },
  slotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  slotButtonBooked: {
    backgroundColor: '#e5e7eb',
  },
  slotButtonSelected: {
    backgroundColor: '#059669',
  },
  slotText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  slotTextBooked: {
    color: '#9ca3af',
  },
  noSlotsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerInfo: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  bookButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
