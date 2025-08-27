import { describe, it, expect } from 'vitest';
import { hello } from '../index.js';

describe('hello function', () => {
  it('should return hello world by default', () => {
    expect(hello()).toBe('Hello, World!');
  });

  it('should return hello with custom name', () => {
    expect(hello('Alice')).toBe('Hello, Alice!');
  });
});