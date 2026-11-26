// Identifies one account on one server, for data stored per connection.
export function connectionKey(serverUrl: string, username: string): string {
  return `${serverUrl.replace(/\/+$/, "")}|${username}`;
}
