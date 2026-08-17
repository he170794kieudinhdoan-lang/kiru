import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X, BookOpen, Clock, ShieldCheck, Share2, Upload } from 'lucide-react-native';

interface GuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconBox}>
                <BookOpen size={16} color="#000000" strokeWidth={2.5} />
              </View>
              <Text style={styles.modalTitle}>HƯỚNG DẪN SỬ DỤNG</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <X size={18} color="#000000" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>B1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Nhập mã khoá 4 số</Text>
                <Text style={styles.stepDesc}>
                  Nhập bất kỳ mã 4 chữ số (ví dụ: 1234, 8888, 9999) để tạo hoặc mở thư mục bảo mật của bạn.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>B2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Tải ảnh & video</Text>
                <Text style={styles.stepDesc}>
                  Chọn ảnh hoặc video từ thư viện máy để tải lên đám mây tốc độ cao.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>B3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Chia sẻ & tải về</Text>
                <Text style={styles.stepDesc}>
                  Bấm Chia Sẻ gửi mã hoặc link cho bạn bè để họ cùng xem và lưu về máy.
                </Text>
              </View>
            </View>

            {/* Expiration Note */}
            <View style={styles.noteBox}>
              <Clock size={18} color="#000000" strokeWidth={2.5} />
              <View style={styles.noteContent}>
                <Text style={styles.noteTitle}>Tự động huỷ sau 30 phút</Text>
                <Text style={styles.noteDesc}>
                  Tất cả các tệp tải lên sẽ tự động biến mất và xoá vĩnh viễn khỏi máy chủ đúng 30 phút sau khi tải lên.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.doneBtnText}>ĐÃ HIỂU</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFDF9',
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
    backgroundColor: '#FFE600',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 16,
    maxHeight: 380,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  stepBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: '#000000',
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: '#444444',
    lineHeight: 17,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFE600',
    borderWidth: 2,
    borderColor: '#000000',
    padding: 12,
    gap: 10,
    marginTop: 6,
    marginBottom: 6,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 2,
  },
  noteDesc: {
    fontSize: 11,
    color: '#222222',
    lineHeight: 16,
  },
  modalFooter: {
    padding: 12,
    borderTopWidth: 2,
    borderTopColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  doneBtn: {
    backgroundColor: '#4ADE80',
    borderWidth: 2,
    borderColor: '#000000',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
});
