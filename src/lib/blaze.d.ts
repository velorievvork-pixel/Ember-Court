export interface BlazeOptions {
  height?: number; distortion?: number; distortionScale?: number; speed?: number;
  sparks?: number; sparkDensity?: number; sparkSize?: number; layers?: number;
  smoke?: number; glow?: number; sparkColor?: [number, number, number]; smokeColor?: [number, number, number];
}
export interface BlazeInstance { setOptions(o: BlazeOptions): void; resize(): void; destroy(): void }
export function createBlaze(
  els: { source: HTMLCanvasElement; content: HTMLElement; output: HTMLCanvasElement },
  options?: BlazeOptions,
): BlazeInstance | null;
export function supportsHtmlInCanvas(): boolean;
