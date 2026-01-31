/* tslint:disable */
/* eslint-disable */

export function brightness(pixels: Uint8Array, amount: number): void;

export function contrast(pixels: Uint8Array, amount: number): void;

export function crop(pixels: Uint8Array, width: number, height: number, start_x: number, start_y: number, new_width: number, new_height: number): Uint8Array;

export function cyberpunk(pixels: Uint8Array): void;

export function flip_horizontal(pixels: Uint8Array, width: number, height: number): Uint8Array;

export function flip_vertical(pixels: Uint8Array, width: number, height: number): Uint8Array;

export function grayscale(pixels: Uint8Array): void;

export function invert(pixels: Uint8Array): void;

export function lofi(pixels: Uint8Array): void;

export function resize(pixels: Uint8Array, width: number, height: number, new_width: number, new_height: number): Uint8Array;

export function sepia(pixels: Uint8Array): void;

export function vignette(pixels: Uint8Array, width: number, height: number, strength: number): void;

export function vintage(pixels: Uint8Array): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly brightness: (a: number, b: number, c: any, d: number) => void;
    readonly contrast: (a: number, b: number, c: any, d: number) => void;
    readonly crop: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly cyberpunk: (a: number, b: number, c: any) => void;
    readonly flip_horizontal: (a: number, b: number, c: number, d: number) => [number, number];
    readonly flip_vertical: (a: number, b: number, c: number, d: number) => [number, number];
    readonly grayscale: (a: number, b: number, c: any) => void;
    readonly invert: (a: number, b: number, c: any) => void;
    readonly lofi: (a: number, b: number, c: any) => void;
    readonly resize: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly sepia: (a: number, b: number, c: any) => void;
    readonly vignette: (a: number, b: number, c: any, d: number, e: number, f: number) => void;
    readonly vintage: (a: number, b: number, c: any) => void;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
