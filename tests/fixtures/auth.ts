import { test as base } from '@playwright/test';

export const test = base.extend({
    storageState: 'tests/.auth/user.json',
});

export { expect } from '@playwright/test';
