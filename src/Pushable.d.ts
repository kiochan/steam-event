export interface Pushable<T> {
  push: (event: T) => void
  close: () => void
}
