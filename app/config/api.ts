// API Configuration
// Uses environment variable in production, falls back to localhost in development

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  applicants: `${API_URL}/api/applicants`,
  applicantStats: `${API_URL}/api/applicants/stats`,
  health: `${API_URL}/api/health`,
};
