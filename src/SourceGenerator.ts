import type { Source } from './Source'

export type SourceGenerator<T> = (src: Source<T>) => void
