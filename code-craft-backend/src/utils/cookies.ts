import { Response } from 'express';
import { config } from '../config/env';
import ms from 'ms';
import type { StringValue } from 'ms';

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
  domain?: string;
}

/**
 * Get cookie options based on environment
 */
export const getCookieOptions = (): CookieOptions => {
  // Parse JWT expiration to milliseconds
  const maxAge = ms(config.jwtExpiresIn as StringValue);
  
  return {
    httpOnly: true, // Prevent JavaScript access (XSS protection)
    secure: config.secureCookies, // HTTPS only in production
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax', // 'none' for cross-origin requests
    maxAge, // Cookie expiration time
    path: '/', // Cookie available for entire domain
    domain: config.cookieDomain, // Optional domain restriction
  };
};

/**
 * Set authentication cookie
 */
export const setAuthCookie = (res: Response, token: string): void => {
  const options = getCookieOptions();
  
  // Use __Host- prefix for enhanced security in production
  // __Host- cookies must be: secure, path=/, no domain attribute
  const cookieName = config.nodeEnv === 'production' && config.secureCookies
    ? '__Host-auth-token'
    : 'auth-token';
  
  // Ensure __Host- requirements are met
  if (cookieName.startsWith('__Host-')) {
    options.secure = true;
    options.path = '/';
    delete options.domain; // __Host- cookies cannot have domain attribute
  }
  
  res.cookie(cookieName, token, options);
};

/**
 * Clear authentication cookie
 */
export const clearAuthCookie = (res: Response): void => {
  const options = getCookieOptions();
  
  // Use same cookie name as setAuthCookie
  const cookieName = config.nodeEnv === 'production' && config.secureCookies
    ? '__Host-auth-token'
    : 'auth-token';
  
  // Ensure __Host- requirements are met
  if (cookieName.startsWith('__Host-')) {
    options.secure = true;
    options.path = '/';
    delete options.domain;
  }
  
  // Set maxAge to 0 to immediately expire the cookie
  res.cookie(cookieName, '', { ...options, maxAge: 0 });
};

/**
 * Set CSRF token cookie (readable by JavaScript for inclusion in headers)
 */
export const setCsrfCookie = (res: Response, csrfToken: string): void => {
  // CSRF cookie must be readable by JavaScript
  const csrfOptions: CookieOptions = {
    httpOnly: false, // Must be false so frontend JavaScript can read it
    secure: config.nodeEnv === 'production', // HTTPS only in production
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
    maxAge: 60 * 60 * 1000, // 1 hour
    path: '/',
  };
  
  // For production cross-origin requests, don't set domain to allow browser to handle it
  if (config.nodeEnv !== 'production' && config.cookieDomain) {
    csrfOptions.domain = config.cookieDomain;
  }
  
  res.cookie('csrf-token', csrfToken, csrfOptions);
};
