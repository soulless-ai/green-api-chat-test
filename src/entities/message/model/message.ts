export interface Message {
  id: string;
  chatId: string;
  direction: 'in' | 'out';
  text: string;
  timestamp: number;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  senderName?: string;
  isOptimistic?: boolean;
  isDeleted?: boolean;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
}
