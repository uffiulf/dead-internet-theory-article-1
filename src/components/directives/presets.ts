export type PresetOptions = Record<string, unknown>
export type Preset = (el: HTMLElement, opts?: PresetOptions) => void

export const parse = (value: string) => {
  const [kind, ...restParts] = value.split(' ')
  return { kind, rest: restParts.join(' ') }
}


