import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/ui/toast/ToastProvider';
import { useCredentialsStore, getDefaultMessenger } from '@/entities/credentials/model/credentials';
import { Button } from '@/shared/ui/Button';
import { messengerProfiles } from '@/shared/api/green-api/profiles';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getStateInstance, setHttpApiSettings } from '@/shared/api/repositories/instance.repository';
import type { MessengerId } from '@/shared/types/messenger';

interface FormValues {
  idInstance: string;
  apiTokenInstance: string;
  apiUrl?: string;
  messenger: MessengerId;
}

export function LoginPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const setCredentials = useCredentialsStore((state) => state.setCredentials);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { messenger: getDefaultMessenger(), apiUrl: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setCredentials(
      {
        idInstance: values.idInstance.trim(),
        apiTokenInstance: values.apiTokenInstance.trim(),
        apiUrl: values.apiUrl?.trim() || undefined,
        messenger: values.messenger,
      },
      true,
    );

    const client = new GreenApiHttpClient(() => useCredentialsStore.getState().credentials);
    try {
      const state = await getStateInstance(client);
      if (state === 'authorized') await setHttpApiSettings(client);
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Не удалось проверить инстанс', 'error');
    }
    navigate('/chats');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">GREEN-API Chat</h1>
          <p className="text-sm text-slate-500">Войдите с помощью данных инстанса</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Мессенджер</label>
          <select {...register('messenger')} className="w-full border rounded-lg px-3 py-2">
            {Object.values(messengerProfiles).map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">idInstance</label>
          <input {...register('idInstance', { required: 'Укажите idInstance' })} className="w-full border rounded-lg px-3 py-2" />
          {errors.idInstance ? <p className="text-sm text-red-500 mt-1">{errors.idInstance.message}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">apiTokenInstance</label>
          <input {...register('apiTokenInstance', { required: 'Укажите apiTokenInstance' })} type="password" className="w-full border rounded-lg px-3 py-2" />
          {errors.apiTokenInstance ? <p className="text-sm text-red-500 mt-1">{errors.apiTokenInstance.message}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">apiUrl (необязательно)</label>
          <input {...register('apiUrl')} placeholder="https://api.green-api.com" className="w-full border rounded-lg px-3 py-2" />
        </div>

        <Button variant="primary" size="lg" type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Вход...' : 'Войти'}
        </Button>
      </form>
    </div>
  );
}
