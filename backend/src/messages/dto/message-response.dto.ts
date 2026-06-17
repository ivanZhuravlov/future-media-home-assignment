export interface MessageAuthorResponse {
  id: string;
  username: string;
}

export interface MessageResponse {
  id: string;
  content: string;
  tag: string;
  authorId: string;
  author: MessageAuthorResponse;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesListResponse {
  items: MessageResponse[];
  nextCursor: string | null;
}
