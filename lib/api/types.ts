export type AuthUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type AuthPayload = TokenPair & {
  user: AuthUser;
};

export type ApiSuccess<T> = { data: T };

export type ApiListSuccess<T> = { data: T[]; meta: import("@/lib/types/entities").ListMeta };

/** Nest `ConflictException` / `UnprocessableEntityException` with `{ code, message }`. */
export type ApiBusinessErrorPayload = {
  code: string;
  message: string;
};

export type ApiErrorBody = {
  statusCode?: number;
  message?: string | string[] | ApiBusinessErrorPayload;
  error?: string;
};
