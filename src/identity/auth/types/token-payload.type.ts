export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export interface RefreshTokenPayload extends AccessTokenPayload {
  tokenId: string;
}
