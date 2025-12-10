import { ApiService } from './apiService';
import { ENDPOINTS } from '@/lib/constants/endpoints';
import { Attachment } from '@/lib/types';

/**
 * Upload a single file to a topic
 * @param topicId - The topic ID
 * @param file - The file to upload
 * @returns Promise with attachment metadata
 */
export const uploadFileToTopic = async (
  topicId: string,
  file: File
): Promise<Omit<Attachment, 'id' | 'created_at'>> => {
  try {
    const response = await ApiService.uploadFile(ENDPOINTS.TOPICS_UPLOAD(topicId), file);
    return response.data;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

/**
 * Upload multiple files to a topic
 * @param topicId - The topic ID
 * @param files - Array of files to upload
 * @returns Promise with array of attachment metadata
 */
export const uploadFilesToTopic = async (
  topicId: string,
  files: File[]
): Promise<Omit<Attachment, 'id' | 'created_at'>[]> => {
  try {
    const uploadPromises = files.map(file => uploadFileToTopic(topicId, file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple file upload failed:', error);
    throw error;
  }
};


/**
 * Format bytes to human-readable size
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Get file icon based on mime type
 * @param mimeType - The MIME type of the file
 * @returns Icon name or emoji
 */
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return '🗜️';
  return '📎';
};

/**
 * Check if file is an image
 * @param mimeType - The MIME type of the file
 * @returns True if file is an image
 */
export const isImage = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

/**
 * Check if file is a video
 * @param mimeType - The MIME type of the file
 * @returns True if file is a video
 */
export const isVideo = (mimeType: string): boolean => {
  return mimeType.startsWith('video/');
};
