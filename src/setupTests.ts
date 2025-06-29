import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { server } from './mocks/server';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());