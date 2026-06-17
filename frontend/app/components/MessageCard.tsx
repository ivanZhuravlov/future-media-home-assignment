'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Message, UpdateMessagePayload } from '../lib/api';
import { TAGS } from '../lib/tags';
import { TagBadge } from './TagBadge';

const MAX_CONTENT_LENGTH = 240;

interface MessageCardProps {
  message: Message;
  currentUserId?: string;
  onUpdate: (
    id: string,
    payload: UpdateMessagePayload,
  ) => Promise<Message | void>;
  onDelete: (id: string) => Promise<void>;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function MessageCard({
  message,
  currentUserId,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: MessageCardProps) {
  const isOwner = Boolean(currentUserId && message.authorId === currentUserId);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(message.content);
  const [draftTag, setDraftTag] = useState(message.tag);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setDraftContent(message.content);
      setDraftTag(message.tag);
    }
  }, [message.content, message.tag, isEditing]);

  const hasChanges =
    draftContent !== message.content || draftTag !== message.tag;
  const isSaveDisabled =
    isUpdating ||
    !draftContent.trim() ||
    draftContent.length > MAX_CONTENT_LENGTH ||
    !hasChanges;

  function handleStartEdit(): void {
    setDraftContent(message.content);
    setDraftTag(message.tag);
    setError(null);
    setIsEditing(true);
  }

  function handleCancelEdit(): void {
    setDraftContent(message.content);
    setDraftTag(message.tag);
    setError(null);
    setIsEditing(false);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (isSaveDisabled) {
      return;
    }

    setError(null);

    try {
      await onUpdate(message.id, {
        content: draftContent.trim(),
        tag: draftTag,
      });
      setIsEditing(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Failed to update message',
      );
    }
  }

  async function handleDelete(): Promise<void> {
    if (
      !window.confirm('Delete this message? This action cannot be undone.')
    ) {
      return;
    }

    setError(null);

    try {
      await onDelete(message.id);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete message',
      );
    }
  }

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-900">
            {message.author.username}
          </span>
          {!isEditing ? <TagBadge tag={message.tag} /> : null}
        </div>
        <div className="flex items-center gap-2">
          <time dateTime={message.createdAt} className="text-xs text-zinc-500">
            {formatTimestamp(message.createdAt)}
          </time>
          {isOwner && !isEditing ? (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handleStartEdit}
                disabled={isDeleting}
                className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
                className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={(event) => void handleSave(event)} className="mt-3 space-y-3">
          <div>
            <label
              htmlFor={`edit-tag-${message.id}`}
              className="block text-xs font-medium text-zinc-600"
            >
              Tag
            </label>
            <select
              id={`edit-tag-${message.id}`}
              value={draftTag}
              onChange={(event) => setDraftTag(event.target.value)}
              disabled={isUpdating}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 focus:ring-2 disabled:opacity-50 sm:max-w-xs"
            >
              {TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`edit-content-${message.id}`}
              className="block text-xs font-medium text-zinc-600"
            >
              Message
            </label>
            <textarea
              id={`edit-content-${message.id}`}
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              maxLength={MAX_CONTENT_LENGTH}
              rows={4}
              disabled={isUpdating}
              className="mt-1 w-full resize-y rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-blue-500 focus:ring-2 disabled:opacity-50"
            />
            <p
              className={`mt-1 text-right text-xs ${
                draftContent.length >= MAX_CONTENT_LENGTH
                  ? 'text-amber-600'
                  : 'text-zinc-500'
              }`}
            >
              {draftContent.length}/{MAX_CONTENT_LENGTH}
            </p>
          </div>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSaveDisabled}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdating ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isUpdating}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-800">
            {message.content}
          </p>
          {error ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </>
      )}
    </article>
  );
}
