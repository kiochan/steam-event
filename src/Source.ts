import type { SourceOptions } from './SourceOptions'
import type { Connection } from './Connection'
import type { Pushable } from './Pushable'
import type { SourceGenerator } from './SourceGenerator'

/**
 * source is Source of events who can be listened
 */
export class Source<T> implements Pushable<T> {
  /**
   * default options
   * @see SourceOptions
   */
  static readonly DEFAULT = Object.freeze({
    bufferSize: Infinity,
    useCommonStream: false
  })

  /**
   * event symbols for `closed`
   */
  static readonly CLOSE_EVENT: unique symbol = Symbol('CLOSE_EVENT')

  /**
   * a array to hold events
   */
  protected readonly events: Array<typeof Source.CLOSE_EVENT | T> = []

  /**
   * a array to hold connected sources
   */
  protected readonly connectedSources = new Set<Pushable<T>>()

  /**
   * buffer size
   * @see SourceOptions.bufferSize
   */
  protected readonly bufferSize: number

  /**
   * use common stream
   * @see SourceOptions.useCommonStream
   */
  protected readonly isStreamShared: boolean

  /**
   * is source closed
   */
  protected isClosed: boolean = false

  /**
   * create a source
   * @param generator generator function to generate source
   * @param options options to configure source
   */
  constructor(generator?: SourceGenerator<T>, options: SourceOptions = {}) {
    // set options to member
    this.bufferSize = options.bufferSize ?? Source.DEFAULT.bufferSize
    this.isStreamShared =
      options.useCommonStream ?? Source.DEFAULT.useCommonStream

    // call generator function if exists
    if (generator != null) generator(this)
  }

  /**
   * push a event to event list
   * @param value value to push
   */
  push(value: T): void {
    // if source is closed, do nothing
    if (this.isClosed) return

    if (!this.isStreamShared) {
      this.events.push(value)
      if (this.bufferSize > this.events.length) {
        this.events.shift()
      }
    }

    this.connectedSources.forEach((source) => {
      source.push(value)
    })
  }

  /**
   * close source
   */
  close(): void {
    this.events.push(Source.CLOSE_EVENT)
    this.connectedSources.forEach((source) => {
      source.close()
    })
    this.isClosed = true
  }

  /**
   * connect source to another source
   * @param source source to connect
   */
  connect(source: Pushable<T>): Connection {
    this.connectedSources.add(source)
    if (!this.isStreamShared) {
      this.events.forEach((event) => {
        if (event === Source.CLOSE_EVENT) {
          source.close()
          return
        }
        source.push(event)
      })
    }
    return {
      disconnect: () => {
        this.connectedSources.delete(source)
      }
    }
  }
}
