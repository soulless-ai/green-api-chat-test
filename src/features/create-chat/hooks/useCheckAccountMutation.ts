import { useMutation } from '@tanstack/react-query';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { checkAccount } from '@/shared/api/repositories/chats.repository';

export function useCheckAccountMutation() {
  const credentials = useCredentialsStore((state) => state.credentials);
  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      if (!credentials) throw new Error('No credentials');
      const client = new GreenApiHttpClient(() => credentials);
      return checkAccount(client, phoneNumber);
    },
  });
}
