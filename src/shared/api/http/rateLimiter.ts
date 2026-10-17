const METHOD_LIMITS_PER_SECOND: Record<string, number> = {
  getSettings: 1,
  setSettings: 1,
  getStateInstance: 1,
  getStatusInstance: 1,
  reboot: 1,
  logout: 1,
  qr: 3,
  scanQrCode: 1,
  setProfilePicture: 0.1,
  getWaSettings: 1,
  sendFileByUpload: 50,
  sendFileByUrl: 50,
  receiveNotification: 100,
  deleteNotification: 100,
  downloadFile: 5,
  getChatHistory: 1,
  getMessage: 10,
  lastIncomingMessages: 1,
  lastOutgoingMessages: 1,
  createGroup: 1,
  updateGroupName: 1,
  getGroupData: 1,
  addGroupParticipant: 10,
  removeGroupParticipant: 10,
  setGroupAdmin: 10,
  removeAdmin: 10,
  setGroupPicture: 1,
  leaveGroup: 10,
  readChat: 10,
  getDeviceInfo: 1,
  checkWhatsapp: 10,
  getAvatar: 10,
  getContacts: 1,
  getContactInfo: 1,
  getChats: 1,
  editMessage: 1,
  deleteMessage: 10,
  archiveChat: 10,
  unarchiveChat: 10,
  setDisappearingChat: 1,
  sendMessage: 50,
  sendLocation: 50,
  sendContact: 50,
  sendPoll: 50,
  sendTyping: 50,
  getMessagesCount: 1,
  showMessagesQueue: 1,
  clearMessagesQueue: 1,
  getWebhooksCount: 1,
  clearWebhooksQueue: 1,
  forwardMessages: 50,
  deleteStatus: 10,
  getIncomingStatuses: 1,
  getOutgoingStatuses: 1,
  getStatusStatistic: 1,
  sendTextStatus: 5,
  sendVoiceStatus: 5,
  sendMediaStatus: 5,
  sendReaction: 50,
};

const DEFAULT_LIMIT_PER_SECOND = 1;

const queues = new Map<string, Promise<unknown>>();
const nextAllowedAt = new Map<string, number>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function queueKey(method: string, idInstance: string): string {
  return `${idInstance}:${method}`;
}

export function limitMethod<T>(
  method: string,
  idInstance: string,
  task: () => Promise<T>,
): Promise<T> {
  const key = queueKey(method, idInstance);
  const limit =
    METHOD_LIMITS_PER_SECOND[method] ?? DEFAULT_LIMIT_PER_SECOND;
  const interval = Math.ceil(1000 / limit);
  const previous = queues.get(key) ?? Promise.resolve();

  const run = previous.then(async () => {
    const wait = Math.max(0, (nextAllowedAt.get(key) ?? 0) - Date.now());
    if (wait > 0) await delay(wait);
    nextAllowedAt.set(key, Date.now() + interval);
    return task();
  });

  queues.set(
    key,
    run.then(
      () => undefined,
      () => undefined,
    ),
  );

  return run;
}
