export type Preset = (el: HTMLElement, opts?: Record<string, any>) => void

export const parse = (value: string) => {
  const [kind, ...restParts] = value.split(' ')
  return { kind, rest: restParts.join(' ') }
}


