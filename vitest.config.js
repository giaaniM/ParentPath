import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node', // calcoli puri, non serve DOM
        include: ['tests/unit/**/*.test.js'],
        reporter: ['verbose'],
    },
});
