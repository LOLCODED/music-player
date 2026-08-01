export function toErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return "The server took too long to respond";
  }
  return error instanceof Error ? error.message : "Unknown error";
}
