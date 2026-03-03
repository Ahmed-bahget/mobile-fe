import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiService } from '@/services/api';
import { Pitch } from '@/types/api';
import { Plus, X } from 'lucide-react-native';

export default function EditPitchScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    pricePerHour: '',
    size: '5v5',
    surface: 'Artificial Grass',
  });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  const sizes = ['5v5', '7v7', '11v11'];
  const surfaces = ['Artificial Grass', 'Natural Grass', 'Indoor'];

  useEffect(() => {
    loadPitch();
  }, [id]);

  const loadPitch = async () => {
    try {
      const data = await apiService.getPitch(id as string);
      setPitch(data);
      setFormData({
        name: data.name,
        description: data.description,
        location: data.location,
        address: data.address,
        pricePerHour: data.pricePerHour.toString(),
        size: data.size,
        surface: data.surface,
      });
      setAmenities(data.amenities || []);
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to load pitch'
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.description ||
      !formData.location ||
      !formData.address ||
      !formData.pricePerHour
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const price = parseFloat(formData.pricePerHour);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setSaving(true);

    try {
      await apiService.updatePitch(id as string, {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        pricePerHour: price,
        size: formData.size,
        surface: formData.surface,
        amenities,
      });

      Alert.alert('Success', 'Pitch updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to update pitch'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Edit Pitch</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pitch Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., City Center Football Pitch"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your pitch..."
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Downtown"
              value={formData.location}
              onChangeText={(text) =>
                setFormData({ ...formData, location: text })
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full address"
              value={formData.address}
              onChangeText={(text) =>
                setFormData({ ...formData, address: text })
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price per Hour ($) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={formData.pricePerHour}
              onChangeText={(text) =>
                setFormData({ ...formData, pricePerHour: text })
              }
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pitch Size *</Text>
            <View style={styles.optionsRow}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    formData.size === size && styles.optionButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, size })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.size === size && styles.optionTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Surface Type *</Text>
            <View style={styles.optionsRow}>
              {surfaces.map((surface) => (
                <TouchableOpacity
                  key={surface}
                  style={[
                    styles.optionButton,
                    formData.surface === surface && styles.optionButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, surface })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.surface === surface && styles.optionTextActive,
                    ]}
                  >
                    {surface}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amenities</Text>
            <View style={styles.amenityInputRow}>
              <TextInput
                style={[styles.input, styles.amenityInput]}
                placeholder="Add amenity"
                value={newAmenity}
                onChangeText={setNewAmenity}
              />
              <TouchableOpacity style={styles.addButton} onPress={addAmenity}>
                <Plus size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {amenities.length > 0 && (
              <View style={styles.amenitiesList}>
                {amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityTag}>
                    <Text style={styles.amenityTagText}>{amenity}</Text>
                    <TouchableOpacity onPress={() => removeAmenity(index)}>
                      <X size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Update Pitch</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  optionButtonActive: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
  },
  optionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#10b981',
  },
  amenityInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  amenityInput: {
    flex: 1,
  },
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#10b981',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  amenityTagText: {
    fontSize: 14,
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
