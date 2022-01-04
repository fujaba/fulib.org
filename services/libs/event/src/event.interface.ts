export interface EventPayload<T> {
  event: string;
  data: T;
  users?: string[];
}
