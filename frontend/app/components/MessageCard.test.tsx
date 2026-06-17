import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Message } from '../lib/api';
import { MessageCard } from './MessageCard';

const mockMessage: Message = {
  id: 'msg-1',
  content: 'Original content',
  tag: 'General',
  authorId: 'user-1',
  author: {
    id: 'user-1',
    username: 'alice',
  },
  createdAt: '2025-01-01T12:00:00.000Z',
  updatedAt: '2025-01-01T12:00:00.000Z',
};

describe('MessageCard', () => {
  it('toggles inline edit and calls update handler on save', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn().mockResolvedValue(undefined);
    const onDelete = jest.fn();

    render(
      <MessageCard
        message={mockMessage}
        currentUserId="user-1"
        onUpdate={onUpdate}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText('Original content')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Original content');

    await user.clear(textarea);
    await user.type(textarea, 'Updated content');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith('msg-1', {
        content: 'Updated content',
        tag: 'General',
      });
    });

    expect(screen.getByText('Original content')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('cancels inline edit without calling update handler', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();
    const onDelete = jest.fn();

    render(
      <MessageCard
        message={mockMessage}
        currentUserId="user-1"
        onUpdate={onUpdate}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Discarded changes');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText('Original content')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('does not render edit controls for non-owners', () => {
    render(
      <MessageCard
        message={mockMessage}
        currentUserId="other-user"
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });
});
