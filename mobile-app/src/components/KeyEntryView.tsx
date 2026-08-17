import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FolderOpen, ArrowRight, History, Trash2, HelpCircle, AlertCircle } from 'lucide-react-native';
import { sanitizeKey, isValidKey } from '../lib/utils';
import { GuideModal } from './GuideModal';

const LS_RECENT_KEYS = 'supavault_recent_keys';

interface KeyEntryViewProps {
  onSelectKey: (key: string) => void;
}

export const KeyEntryView: React.FC<KeyEntryViewProps> = ({ onSelectKey }) => {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');
  const [recentKeys, setRecentKeys] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadRecentKeys();
  }, []);

  const loadRecentKeys = async () => {
    try {
      const saved = await AsyncStorage.getItem(LS_RECENT_KEYS);
      if (saved) {
        setRecentKeys(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error reading recent keys:', e);
    }
  };

  const saveRecentKey = async (k: string) => {
    try {
      const updated = [k, ...recentKeys.filter((item) => item !== k)].slice(0, 5);
      setRecentKeys(updated);
      await AsyncStorage.setItem(LS_RECENT_KEYS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving recent keys:', e);
    }
  };

  const removeRecentKey = async (k: string) => {
    try {
      const updated = recentKeys.filter((item) => item !== k);
      setRecentKeys(updated);
      await AsyncStorage.setItem(LS_RECENT_KEYS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error removing recent key:', e);
    }
  };

  const handleAccessKey = (directKey?: string) => {
    setError('');
    const targetKey = sanitizeKey(directKey || inputKey);

    if (!isValidKey(targetKey)) {
      setError('Vui lòng nhập đúng 4 chữ số!');
      return;
    }

    saveRecentKey(targetKey);
    onSelectKey(targetKey);
  };

  const digits = inputKey.padEnd(4, ' ').split('').slice(0, 4);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Main Card */}
        <View style={styles.card}>
          {/* Card Header with Title & Help button */}
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>NHẬP </Text>
              <View style={styles.yellowBadge}>
                <Text style={styles.yellowBadgeText}>KEY</Text>
              </View>
              <Text style={styles.titleText}> ĐỂ MỞ</Text>
            </View>

            <TouchableOpacity
              style={styles.helpBtn}
              onPress={() => setShowGuide(true)}
              activeOpacity={0.8}
            >
              <HelpCircle size={18} color="#000000" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subTitle}>
            Nhập mã 4 số bí mật để truy cập hoặc tạo thư mục ảnh & video tạm thời.
          </Text>

          {/* Hidden text input for native typing */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={inputKey}
            onChangeText={(text) => {
              const sanitized = sanitizeKey(text);
              setInputKey(sanitized);
              setError('');
              if (sanitized.length === 4) {
                // Auto trigger or keep ready
              }
            }}
            keyboardType="number-pad"
            maxLength={4}
            autoFocus
          />

          {/* 4 Digit Boxes Visual */}
          <TouchableOpacity
            style={styles.pinBoxesContainer}
            onPress={() => inputRef.current?.focus()}
            activeOpacity={1}
          >
            {[0, 1, 2, 3].map((index) => {
              const char = inputKey[index];
              const isFocused = inputKey.length === index;
              return (
                <View
                  key={index}
                  style={[
                    styles.pinBox,
                    isFocused && styles.pinBoxFocused,
                    Boolean(char) && styles.pinBoxFilled,
                  ]}
                >
                  <Text style={styles.pinText}>{char || '•'}</Text>
                </View>
              );
            })}
          </TouchableOpacity>

          {/* Error Banner */}
          {Boolean(error) && (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Action Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              inputKey.length === 4 ? styles.submitBtnActive : styles.submitBtnDisabled,
            ]}
            onPress={() => handleAccessKey()}
            activeOpacity={0.8}
          >
            <FolderOpen size={20} color="#000000" strokeWidth={2.5} />
            <Text style={styles.submitBtnText}>MỞ THƯ MỤC</Text>
            <ArrowRight size={18} color="#000000" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Recent Keys List */}
          {recentKeys.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <History size={14} color="#666666" strokeWidth={2.5} />
                <Text style={styles.recentTitle}>KEY GẦN ĐÂY:</Text>
              </View>

              <View style={styles.recentList}>
                {recentKeys.map((key) => (
                  <View key={key} style={styles.recentItemWrapper}>
                    <TouchableOpacity
                      style={styles.recentItem}
                      onPress={() => handleAccessKey(key)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.recentItemText}>#{key}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.recentDeleteBtn}
                      onPress={() => removeRecentKey(key)}
                      activeOpacity={0.8}
                    >
                      <Trash2 size={13} color="#999999" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Expiration Feature Banner */}
        <View style={styles.featureBox}>
          <Text style={styles.featureTitle}>⏱️ TỰ ĐỘNG XOÁ SAU 30 PHÚT</Text>
          <Text style={styles.featureDesc}>
            Bảo mật tối đa, tất cả tệp tự huỷ vĩnh viễn trên máy chủ khi hết hạn.
          </Text>
        </View>
      </ScrollView>

      {/* Guide Help Modal */}
      <GuideModal
        visible={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
  },
  yellowBadge: {
    backgroundColor: '#FFE600',
    borderWidth: 2,
    borderColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginHorizontal: 3,
    transform: [{ rotate: '-1deg' }],
  },
  yellowBadgeText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
  },
  helpBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  subTitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 20,
    lineHeight: 17,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  pinBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  pinBox: {
    flex: 1,
    height: 64,
    backgroundColor: '#F8F8F6',
    borderWidth: 3,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  pinBoxFocused: {
    backgroundColor: '#FFFBE6',
    borderColor: '#000000',
  },
  pinBoxFilled: {
    backgroundColor: '#FFE600',
  },
  pinText: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#000000',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B8B',
    borderWidth: 2,
    borderColor: '#000000',
    padding: 10,
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ADE80',
    borderWidth: 3,
    borderColor: '#000000',
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  submitBtnActive: {
    backgroundColor: '#4ADE80',
  },
  submitBtnDisabled: {
    backgroundColor: '#A7F3D0',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  recentSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#E5E5E5',
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  recentTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#666666',
    letterSpacing: 0.5,
  },
  recentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F0',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  recentItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  recentItemText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#000000',
  },
  recentDeleteBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderLeftWidth: 1,
    borderLeftColor: '#CCCCCC',
  },
  featureBox: {
    backgroundColor: '#22D3EE',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 11,
    color: '#111111',
    fontWeight: '500',
    lineHeight: 16,
  },
});
