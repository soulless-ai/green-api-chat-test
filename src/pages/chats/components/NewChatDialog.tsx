import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useChatsStore } from '@/entities/chat/model/chat';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useCheckAccountMutation } from '@/features/create-chat/hooks/useCheckAccountMutation';
import { isValidPhone, normalizePhone } from '@/shared/lib/phone';
import { messengerProfiles } from '@/shared/api/green-api/profiles';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewChatDialog({ open, onClose }: Props) {
  const credentials = useCredentialsStore((state) => state.credentials);
  const addChat = useChatsStore((state) => state.addChat);
  const setActiveChat = useChatsStore((state) => state.setActiveChat);
  const mutation = useCheckAccountMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ phone: string }>();

  useEffect(() => {
    if (!open) {
      reset();
      mutation.reset();
    }
  }, [open, reset, mutation]);

  if (!open || !credentials) return null;

  const onSubmit = async (values: { phone: string }) => {
    if (!isValidPhone(values.phone)) return;
    const phone = normalizePhone(values.phone);
    const result = await mutation.mutateAsync(phone);
    if (!result.exist || !result.chatId) return;
    addChat({
      id: result.chatId,
      chatId: result.chatId,
      title: phone,
      phone,
      messenger: credentials.messenger,
      createdAt: Date.now(),
    });
    setActiveChat(result.chatId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
        <h3 className="text-lg font-semibold">Новый чат</h3>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="new-chat-phone">Номер телефона</label>
          <input
            id="new-chat-phone"
            {...register('phone', {
              required: 'Введите номер',
              validate: (value) => {
                const digits = normalizePhone(value ?? '');
                if (!digits) return 'Введите номер';
                if (digits.length < 11 || digits.length > 12) return 'Номер должен содержать 11 или 12 цифр';
                return true;
              },
            })}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="79991234567"
            className="w-full border rounded-lg px-3 py-2"
          />
          {errors.phone ? <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p> : null}
          <p className="text-xs text-slate-500 mt-1">11 или 12 цифр, без лишних символов. Например: 79991234567.</p>
        </div>
        {mutation.isError ? <p className="text-sm text-red-500">Не удалось проверить номер</p> : null}
        {mutation.data && !mutation.data.exist ? <p className="text-sm text-red-500">Аккаунт не найден в мессенджере</p> : null}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg border">Отмена</button>
          <button type="submit" disabled={mutation.isPending} className="px-3 py-2 rounded-lg bg-brand-500 text-white disabled:opacity-50">
            {mutation.isPending ? 'Проверка...' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  );
}
