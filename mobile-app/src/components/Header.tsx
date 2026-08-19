import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ShieldCheck, Share2, RefreshCw, Clock } from 'lucide-react-native';

interface HeaderProps {
  onRefresh?: () => void;
  onShareKey?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  onShareKey,
  isRefreshing = false,
}) => {
  return (
    <View style={styles.header}>
      {/* Brand logo & Name */}
      <View style={styles.leftContainer}>
        <View style={styles.logoBadge}>
          <ShieldCheck size={18} color="#FFFFFF" strokeWidth={2.2} />
        </View>
        <View style={styles.brandInfo}>
          <Text style={styles.brandTitle}>Kiru</Text>
          <View style={styles.timeTag}>
            <Clock size={10} color="#64748B" strokeWidth={2} />
            <Text style={styles.timeTagText}>30 phút tự huỷ</Text>
          </View>
        </View>
      </View>

      {/* Right Actions: Refresh & Share */}
      <View style={styles.rightContainer}>
        {onRefresh && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onRefresh}
            disabled={isRefreshing}
            activeOpacity={0.7}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <RefreshCw size={16} color="#334155" strokeWidth={2.2} />
            )}
          </TouchableOpacity>
        )}

        {onShareKey && (
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={onShareKey}
            activeOpacity={0.8}
          >
            <Share2 size={14} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.shareBtnText}>Chia sẻ</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  brandInfo: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  timeTagText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
