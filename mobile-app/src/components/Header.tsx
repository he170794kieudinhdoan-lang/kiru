import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, ArrowLeft, Share2, RefreshCw } from 'lucide-react-native';

interface HeaderProps {
  currentKey?: string | null;
  onExitKey?: () => void;
  onRefresh?: () => void;
  onShareKey?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentKey,
  onExitKey,
  onRefresh,
  onShareKey,
  isRefreshing = false,
}) => {
  return (
    <View style={styles.header}>
      {/* Brand logo or Back button */}
      <View style={styles.leftContainer}>
        {currentKey ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onExitKey}
            activeOpacity={0.8}
          >
            <ArrowLeft size={18} color="#000000" strokeWidth={2.5} />
            <Text style={styles.btnTextSmall}>Thoát</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Shield size={16} color="#000000" strokeWidth={2.5} />
            </View>
            <Text style={styles.brandTitle}>
              KIRU <Text style={styles.brandAccent}>VAULT</Text>
            </Text>
          </View>
        )}
      </View>

      {/* Center Key Badge if in vault */}
      {currentKey && (
        <View style={styles.keyBadge}>
          <Text style={styles.keyBadgeLabel}>KEY:</Text>
          <Text style={styles.keyBadgeValue}>#{currentKey}</Text>
        </View>
      )}

      {/* Right Actions */}
      <View style={styles.rightContainer}>
        {currentKey ? (
          <View style={styles.actionsRow}>
            {onRefresh && (
              <TouchableOpacity
                style={[styles.iconBtn, isRefreshing && styles.iconBtnRotating]}
                onPress={onRefresh}
                disabled={isRefreshing}
                activeOpacity={0.8}
              >
                <RefreshCw size={16} color="#000000" strokeWidth={2.5} />
              </TouchableOpacity>
            )}

            {onShareKey && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.shareBtn]}
                onPress={onShareKey}
                activeOpacity={0.8}
              >
                <Share2 size={15} color="#000000" strokeWidth={2.5} />
                <Text style={styles.shareBtnText}>Chia Sẻ</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>⚡ 30 Phút</Text>
          </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 32,
    height: 32,
    backgroundColor: '#FFE600',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  brandAccent: {
    color: '#000000',
    backgroundColor: '#FFE600',
  },
  keyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE600',
    borderWidth: 2,
    borderColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  keyBadgeLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  keyBadgeValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
    fontFamily: 'monospace',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  btnTextSmall: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  },
  shareBtn: {
    backgroundColor: '#22D3EE',
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  },
  iconBtn: {
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
    elevation: 3,
  },
  iconBtnRotating: {
    opacity: 0.6,
  },
  tagBadge: {
    backgroundColor: '#4ADE80',
    borderWidth: 2,
    borderColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
});
