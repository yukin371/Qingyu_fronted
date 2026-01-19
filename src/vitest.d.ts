/**
 * Vitest 类型声明
 */
declare module 'vitest' {
  export function describe(name: string, fn: () => void): void
  export function it(name: string, fn: () => void): void
  export function expect(value: any): any
}

declare module '@vue/test-utils' {
  import { ComponentPublicInstance } from 'vue'
  export interface DOMWrapper<T extends Node> {
    element: T
  }
  export interface VueWrapper<T extends ComponentPublicInstance> {
    componentVM: T
    text(): string
    html(): string
    find(selector: string): any
    findAll(selector: string): any[]
    exists(): boolean
  }
  export function mount(component: any, options?: any): VueWrapper<any>
}
