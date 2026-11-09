import type {
  ApiClientOptions,
  ApiErrorDetails,
  ApiErrorKind,
  ApiRequestOptions,
  ApiResponse,
} from "./types";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly code?: string;
  readonly result?: unknown;

  constructor(
    kind: ApiErrorKind,
    message: string,
    details: ApiErrorDetails = {},
  ) {
    super(message, { cause: details.cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = details.status;
    this.code = details.code;
    this.result = details.result;
  }
}

function getRequestUrl(baseUrl: string | undefined, path: string): string {
  if (!baseUrl?.trim()) {
    throw new ApiError("configuration", "API 기본 주소가 설정되지 않았습니다.");
  }

  let base: URL;
  try {
    base = new URL(baseUrl.trim());
  } catch (cause) {
    throw new ApiError(
      "configuration",
      "API 기본 주소 형식이 올바르지 않습니다.",
      { cause },
    );
  }

  if (
    (base.protocol !== "http:" && base.protocol !== "https:") ||
    base.search ||
    base.hash
  ) {
    throw new ApiError(
      "configuration",
      "API 기본 주소는 쿼리와 해시가 없는 HTTP(S) 주소여야 합니다.",
    );
  }
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new ApiError(
      "request",
      "API 경로는 단일 슬래시(/)로 시작해야 합니다.",
    );
  }

  // baseUrl에 포함된 공통 경로를 유지합니다. path에는 그 뒤의 엔드포인트 경로를 넘깁니다.
  return `${base.href.replace(/\/+$/, "")}${path}`;
}

function createRequestOptions({
  method,
  headers,
  signal,
  json,
}: ApiRequestOptions): RequestInit {
  try {
    const requestHeaders = new Headers(headers);
    if (!requestHeaders.has("Accept"))
      requestHeaders.set("Accept", "application/json");

    const body = json === undefined ? undefined : JSON.stringify(json);
    if (json !== undefined && body === undefined) {
      throw new TypeError("JSON으로 변환할 수 없는 요청 본문입니다.");
    }
    if (body !== undefined && !requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json");
    }

    return { method, headers: requestHeaders, signal, body };
  } catch (cause) {
    throw new ApiError("request", "API 요청을 구성할 수 없습니다.", { cause });
  }
}

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "isSuccess" in value &&
    typeof value.isSuccess === "boolean" &&
    "code" in value &&
    typeof value.code === "string" &&
    "message" in value &&
    typeof value.message === "string"
  );
}

function isCancellation(cause: unknown, signal?: AbortSignal | null): boolean {
  return (
    signal?.aborted === true ||
    (typeof cause === "object" &&
      cause !== null &&
      "name" in cause &&
      cause.name === "AbortError")
  );
}

function createHttpError(status: number, cause?: unknown): ApiError {
  return new ApiError("http", `API 요청에 실패했습니다 (HTTP ${status}).`, {
    status,
    cause,
  });
}

async function parseResponse(response: Response, signal?: AbortSignal | null) {
  let body: unknown;
  try {
    body = await response.json();
  } catch (cause) {
    if (isCancellation(cause, signal)) throw cause;
    if (!response.ok) throw createHttpError(response.status, cause);
    throw new ApiError("protocol", "API 응답을 JSON으로 읽을 수 없습니다.", {
      status: response.status,
      cause,
    });
  }

  if (isApiResponse(body) && !body.isSuccess) {
    throw new ApiError("api", body.message, {
      status: response.status,
      code: body.code,
      result: body.result,
    });
  }
  if (!response.ok) throw createHttpError(response.status);
  if (!isApiResponse(body)) {
    throw new ApiError("protocol", "공통 API 응답 형식이 올바르지 않습니다.", {
      status: response.status,
    });
  }

  return body.result;
}

export function createApiClient({
  baseUrl,
  fetchImpl = fetch,
}: ApiClientOptions) {
  function request(
    path: string,
    options: ApiRequestOptions & { expectResult: false },
  ): Promise<void>;
  function request<TResult>(
    path: string,
    options?: ApiRequestOptions & { expectResult?: true },
  ): Promise<TResult>;
  async function request<TResult>(
    path: string,
    options: ApiRequestOptions = {},
  ) {
    const url = getRequestUrl(baseUrl, path);
    const requestOptions = createRequestOptions(options);
    let response: Response;
    try {
      response = await fetchImpl(url, requestOptions);
    } catch (cause) {
      if (isCancellation(cause, options.signal)) throw cause;
      throw new ApiError("network", "API 서버에 연결할 수 없습니다.", {
        cause,
      });
    }

    const result = await parseResponse(response, options.signal);

    // result가 없는 성공 응답을 반환하는 API는 expectResult: false로 호출합니다.
    // 이 경우에도 HTTP 상태와 isSuccess는 동일하게 검사합니다.
    if (options.expectResult === false) return;
    if (result === undefined || result === null) {
      throw new ApiError("protocol", "API 성공 응답에 result가 없습니다.", {
        status: response.status,
      });
    }

    return result as TResult;
  }

  return { request };
}
