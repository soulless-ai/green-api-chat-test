import { useForm } from 'react-hook-form';
import { useChatsStore } from '@/entities/chat/model/chat';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useCheckAccountMutation } from '@/features/create-chat/hooks/useCheckAccountMutation';
import { isValidPhone, normalizePhone, formatPhone } from '@/shared/lib/phone';
import { messengerProfiles } from '@/shared/api/green-api/profiles';
import { Button } from '@/shared/ui/Button';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewChatDialog({ open, onClose }: Props) {
  const credentials = useCredentialsStore((state) => state.credentials);
  const addChat = useChatsStore((state) => state.addChat);
  const setActiveChat = useChatsStore((state) => state.setActiveChat);
  const mutation = useCheckAccountMutation();

  const profile = credentials ? messengerProfiles[credentials.messenger] : messengerProfiles.whatsapp;

  const { register, handleSubmit, formState: { errors } } = useForm<{ phone: string }>();

  if (!open || !credentials) return null;

  const onSubmit = async (values: { phone: string }) => {
    const digits = normalizePhone(values.phone);
    if (!digits || !isValidPhone(values.phone, profile.phoneLengths[0], profile.phoneLengths[1])) return;

    const result = await mutation.mutateAsync(digits);
    if (!result.exist || !result.chatId) return;

    addChat({
      id: result.chatId,
      chatId: result.chatId,
      title: formatPhone(digits),
      phone: digits,
      messenger: credentials.messenger,
      createdAt: Date.now(),
    });
    setActiveChat(result.chatId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-ga-dark-panel rounded-2xl p-6 w-full max-w-sm space-y-4">
        <h3 className="text-lg font-semibold text-ga-dark-text">Новый чат</h3>
        <div>
          <label className="block text-sm font-medium mb-1 text-ga-dark-text" htmlFor="new-chat-phone">
            Номер телефона
          </label>
          <input
            id="new-chat-phone"
            {...register('phone', {
              required: 'Введите номер',
              validate: (value) => {
                const digits = normalizePhone(value ?? '');
                if (!digits) return 'Введите номер';
                if (!isValidPhone(value ?? '', profile.phoneLengths[0], profile.phoneLengths[1])) {
                  return `Номер должен содержать ${profile.phoneLengths.join(' или ')} цифр`;
                }
                return true;
              },
            })}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder={formatPhone('79991234567')}
            className="w-full border border-ga-dark-border rounded-lg px-3 py-2 text-ga-dark-text bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-ga-primary"
          />
          {errors.phone ? (
            <p className="text-sm text-ga-dark-danger mt-1">{errors.phone.message}</p>
          ) : null}
          <p className="text-xs text-ga-dark-text-secondary mt-1">
            {`${profile.phoneLengths.join(' или ')} цифр, без лишних символов. Например: ${formatPhone('79991234567')}.`}
          </p>
        </div>
        {mutation.isError ? (
          <p className="text-sm text-ga-dark-danger">
            {mutation.error instanceof Error ? mutation.error.message : 'Не удалось проверить номер'}
          </p>
        ) : null}
        {mutation.data && !mutation.data.exist ? (
          <p className="text-sm text-ga-dark-danger">Аккаунт не найден в мессенджере</p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="md" type="button" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" size="md" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Проверка...' : 'Создать'}
          </Button>
        </div>
      </form>
    </div>
  );
}
