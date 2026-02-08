import { Response } from 'express';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * 設定 access token 到 HttpOnly cookie
 */
export const setAccessTokenCookie = (res: Response, token: string): void => {
  res.cookie(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // 允許跨域請求（localhost:3000 → localhost:4000）
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: '/',
  });
};

/**
 * 設定 refresh token 到 HttpOnly cookie
 */
export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // 允許跨域請求（localhost:3000 → localhost:4000）
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: '/',
  });
};

/**
 * 清除 access token cookie
 */
export const clearAccessTokenCookie = (res: Response): void => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
};

/**
 * 清除 refresh token cookie
 */
export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
};
