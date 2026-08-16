import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Vừa xong';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Format remaining minutes before 30m expiration
 */
export function formatRemainingTime(expiresAt: number): string {
  const remainingMs = expiresAt - Date.now();
  if (remainingMs <= 0) return 'Hết hạn';
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  if (minutes > 0) return `${minutes}p ${seconds}s`;
  return `${seconds}s`;
}

/**
 * Tạo mã key ngẫu nhiên đúng 4 chữ số (1000 - 9999)
 */
export function generateRandomKey(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Chỉ cho phép ký tự số và tối đa 4 số
 */
export function sanitizeKey(key: string): string {
  return key.replace(/\D/g, '').slice(0, 4);
}

/**
 * Kiểm tra key hợp lệ (đúng 4 số)
 */
export function isValidKey(key: string): boolean {
  return /^\d{4}$/.test(key);
}

export function isImageFile(filename: string, mimetype?: string): boolean {
  if (mimetype && mimetype.startsWith('image/')) return true;
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'].includes(ext);
}

export function isVideoFile(filename: string, mimetype?: string): boolean {
  if (mimetype && mimetype.startsWith('video/')) return true;
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ['mp4', 'webm', 'mov', 'mkv', 'avi', 'wmv', 'flv', 'ogg', 'm4v'].includes(ext);
}
