import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { Avatar } from '@/shared/ui/Avatar';

interface EmptyChatProps {
  chatTitle: string | null;
}

export function EmptyChat({ chatTitle }: EmptyChatProps) {
  const credentials = useCredentialsStore((state) => state.credentials);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-ga-text dark:text-ga-darkText-secondary">
      <Avatar 
        src={credentials?.avatarUrl ?? undefined}
        name={chatTitle ?? 'Выберите чат'}
        size="lg"
        className="mb-3 opacity-50"
      />
      <p className="text-lg font-medium text-ga-text dark:text-ga-darkText">Выберите или создайте чат</p>
      <p className="text-sm mt-1">Нажмите «Новый чат» и укажите номер телефона собеседника</p>
    </div>
  );
}
