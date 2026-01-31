import { describe, it, expect } from 'vitest';

describe('Example Unit Test', () => {
    it('should pass basic assertion', () => {
        expect(1 + 1).toBe(2);
    });

    it('should demonstrate AAA pattern', () => {
        const value = 'test';

        const result = value.toUpperCase();

        expect(result).toBe('TEST');
    });
});
