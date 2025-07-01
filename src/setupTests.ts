import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { server } from './mocks/server';
import { beforeAll, afterEach, afterAll } from 'vitest';

// Configuration des variables globales pour les tests
if (typeof window !== 'undefined') {
  (window as any).TextEncoder = TextEncoder;
  (window as any).TextDecoder = TextDecoder;
}

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());