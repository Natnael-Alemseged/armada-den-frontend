import React from 'react';
import { Attachment } from '@/lib/types';
import { Download, FileText, Image as ImageIcon, Video, Music, Archive } from 'lucide-react';
import { formatBytes, isImage, isVideo } from '@/lib/util/fileUpload';

interface MessageAttachmentsProps {
  attachments: Attachment[];
  isOwnMessage?: boolean;
  isFailed?: boolean;
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

export function MessageAttachments({ attachments, isOwnMessage = false, isFailed = false }: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null;

  // Separate images/videos from other files
  const mediaFiles = attachments.filter(att => isImage(att.mime_type) || isVideo(att.mime_type));
  const otherFiles = attachments.filter(att => !isImage(att.mime_type) && !isVideo(att.mime_type));

  return (
    <div className="space-y-0">
      {/* Media Files (Images/Videos) - WhatsApp style */}
      {mediaFiles.length > 0 && (
        <div className={`grid gap-0.5 ${mediaFiles.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {mediaFiles.map((attachment) => (
            <a
              key={attachment.id}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden"
            >
              {isImage(attachment.mime_type) ? (
                <img
                  src={attachment.url}
                  alt={attachment.filename}
                  className={`w-full object-cover ${mediaFiles.length === 1 ? 'max-h-66' : 'h-28'}`}
                  loading="lazy"
                />
              ) : (
                <video
                  src={attachment.url}
                  className={`w-full object-cover ${mediaFiles.length === 1 ? 'max-h-66' : 'h-28'}`}
                  controls
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Download className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Other Files - WhatsApp style */}
      {otherFiles.length > 0 && (
        <div className={mediaFiles.length > 0 ? 'pt-2 px-3' : 'p-3'}>
          <div className="space-y-1">
            {otherFiles.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors group ${
                  isOwnMessage && !isFailed
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  isOwnMessage && !isFailed
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {getFileIcon(attachment.mime_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    isOwnMessage && !isFailed ? 'text-white' : 'text-gray-900'
                  }`}>
                    {attachment.filename}
                  </p>
                  <p className={`text-xs ${
                    isOwnMessage && !isFailed ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {formatBytes(attachment.size)}
                  </p>
                </div>
                <Download className={`w-4 h-4 flex-shrink-0 ${
                  isOwnMessage && !isFailed ? 'text-white/70' : 'text-gray-400'
                }`} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
