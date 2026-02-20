// src/config/appConfig.js

// App metadata
export const appInfo = {
    name: 'frontend',
    version: '1.0.0',
    environment: 'development',
};

// API endpoints
export const apiConfig = {
    baseUrl: 'http://localhost:4001/api',
    timeout: 10000, // ms
};

// Feature toggles
export const featureFlags = {
    enableAIAssistant: true,
    enableNFTSupport: false,
    enableAnalytics: true,
};

// UI / Branding
export const uiConfig = {
    theme: 'light',
    primaryColor: '#3b82f6',
    logoPath: '/assets/logo.svg',
};

// Provider configuration
export const PROVIDER_URL = 'https://react-icon-handler.vercel.app/icons/';
export const PROVIDER_ID = '808';

// Other constants
export const defaultLanguage = 'en';