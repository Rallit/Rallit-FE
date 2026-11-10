type ApiResponseMetadata = {
  code: string;
  message: string;
};

export type ApiResponse<TResult> = ApiResponseMetadata &
  (
    | { isSuccess: true; result?: TResult }
    | { isSuccess: false; result?: unknown }
  );

export type ApiErrorKind =
  "configuration" | "request" | "api" | "http" | "protocol" | "network";

export type ApiErrorDetails = {
  status?: number;
  code?: string;
  result?: unknown;
  cause?: unknown;
};

export type ApiRequestOptions = Pick<
  RequestInit,
  "method" | "headers" | "signal"
> & {
  json?: unknown;
  expectResult?: boolean;
};

export type ApiClientOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};
