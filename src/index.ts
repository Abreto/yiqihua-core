export function hello(name: string = 'World'): string {
  return `Hello, ${name}!`;
}

export default hello;

export { yiqihua } from './yiqihua.js';
export type { YiqihuaInput, YiqihuaOutput } from './yiqihua.js';
