/**
 * Source Constructor options
 */
export interface SourceOptions {
  /**
   * buffer size
   */
  bufferSize?: number

  /**
   * use common stream or not
   * true - all listeners will listen a common stream of events
   * false - each listener will listen a separate stream of events
   */
  useCommonStream?: boolean
}
