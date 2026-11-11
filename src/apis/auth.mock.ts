export async function mockStartLogin(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 1000));

  throw new Error("로그인에 실패했습니다. 다시 시도해주세요.");
}