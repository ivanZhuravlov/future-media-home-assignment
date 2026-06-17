'use client';

import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  deleteMessage,
  Message,
  MessagesListResponse,
  updateMessage,
  UpdateMessagePayload,
} from '../lib/api';
import { MessageFeedFilters } from './useMessagesFeed';

const MAX_CONTENT_LENGTH = 240;

function updateMessageInPages(
  data: InfiniteData<MessagesListResponse> | undefined,
  messageId: string,
  updater: (message: Message) => Message,
): InfiniteData<MessagesListResponse> | undefined {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((message) =>
        message.id === messageId ? updater(message) : message,
      ),
    })),
  };
}

function removeMessageFromPages(
  data: InfiniteData<MessagesListResponse> | undefined,
  messageId: string,
): InfiniteData<MessagesListResponse> | undefined {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.filter((message) => message.id !== messageId),
    })),
  };
}

export function useMessageMutations(filters: MessageFeedFilters) {
  const queryClient = useQueryClient();
  const queryKey = ['messages', filters] as const;

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateMessagePayload;
    }) => updateMessage(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<InfiniteData<MessagesListResponse>>(queryKey);

      queryClient.setQueryData<InfiniteData<MessagesListResponse>>(
        queryKey,
        (current) =>
          updateMessageInPages(current, id, (message) => ({
            ...message,
            content: payload.content ?? message.content,
            tag: payload.tag ?? message.tag,
            updatedAt: new Date().toISOString(),
          })),
      );

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSuccess: (updatedMessage) => {
      queryClient.setQueryData<InfiniteData<MessagesListResponse>>(
        queryKey,
        (current) =>
          updateMessageInPages(current, updatedMessage.id, () => updatedMessage),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<InfiniteData<MessagesListResponse>>(queryKey);

      queryClient.setQueryData<InfiniteData<MessagesListResponse>>(
        queryKey,
        (current) => removeMessageFromPages(current, id),
      );

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
  });

  return {
    updateMessage: (id: string, payload: UpdateMessagePayload) =>
      updateMutation.mutateAsync({ id, payload }),
    deleteMessage: (id: string) => deleteMutation.mutateAsync(id),
    updatingId: updateMutation.isPending
      ? updateMutation.variables?.id
      : undefined,
    deletingId: deleteMutation.isPending ? deleteMutation.variables : undefined,
    maxContentLength: MAX_CONTENT_LENGTH,
  };
}
