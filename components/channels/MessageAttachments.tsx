import React from 'react';
import { Attachment } from '@/lib/types';
import { Download, FileText, Image as ImageIcon, Video, Music, Archive } from 'lucide-react';
import { formatBytes, isImage, isVideo } from '@/lib/util/fileUpload';

interface MessageAttachmentsProps {
  attachments: Attachment[];
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
  if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />;
  if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5" />;
  if (mimeType.includes('pdf')) return <FileText className="w-5 h-5" />;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) 
    return <Archive className="w-5 h-5" />;
  return <FileText className="w-5 h-5" />;
};

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null;

  // Separate images/videos from other files
  const mediaFiles = attachments.filter(att => isImage(att.mime_type) || isVideo(att.mime_type));
  const otherFiles = attachments.filter(att => !isImage(att.mime_type) && !isVideo(att.mime_type));

  return (
    <div className="mt-2 space-y-2">
      {/* Media Files (Images/Videos) */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {mediaFiles.map((attachment) => (
            <a
              key={attachment.id}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors"
            >
              {isImage(attachment.mime_type) ? (
                <img
                  src={attachment.url}
                  alt={attachment.filename}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              ) : (
                <video
                  src={attachment.url}
                  className="w-full h-48 object-cover"
                  controls
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Download className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs truncate">{attachment.filename}</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Other Files */}
      {otherFiles.length > 0 && (
        <div className="space-y-1">
          {otherFiles.map((attachment) => (
            <a
              key={attachment.id}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors group"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                {getFileIcon(attachment.mime_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {attachment.filename}
                </p>
                <p className="text-xs text-gray-500">
                  {formatBytes(attachment.size)}
                </p>
              </div>
              <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
