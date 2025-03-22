import '@testing-library/jest-dom';

// Mock ResizeObserver which isn't available in JSDom
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));
