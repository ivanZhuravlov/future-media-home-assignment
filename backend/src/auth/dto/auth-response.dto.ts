export interface AuthTokensResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}
