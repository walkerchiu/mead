import { Response } from 'express';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const REMEMBER_ME_COOKIE = 'remember_me';
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
 *
 * rememberMe=true（預設）：cookie 帶 maxAge，瀏覽器關閉後仍持久化。
 * rememberMe=false：省略 maxAge 與 expires，成為 session cookie（關閉瀏覽器即失效）。
 */
export const setRefreshTokenCookie = (
  res: Response,
  token: string,
  rememberMe = true,
): void => {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // 允許跨域請求（localhost:3000 → localhost:4000）
    ...(rememberMe ? { maxAge: REFRESH_TOKEN_MAX_AGE } : {}),
    path: '/',
  });
};

/**
 * 設定 remember_me 偏好 cookie
 *
 * 此 cookie 僅記錄使用者的「記住我」偏好，供 refreshToken / verifyTwoFactorLogin
 * 時還原 refresh token cookie 應為持久化或 session。true 時寫入持久化 cookie，
 * false 時清除既有偏好 cookie。
 */
export const setRememberMeCookie = (
  res: Response,
  rememberMe: boolean,
): void => {
  if (rememberMe) {
    res.cookie(REMEMBER_ME_COOKIE, '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: '/',
    });
  } else {
    clearRememberMeCookie(res);
  }
};

/**
 * 讀取 remember_me 偏好 cookie
 */
export const readRememberMe = (req: {
  cookies?: Record<string, string>;
}): boolean => req.cookies?.[REMEMBER_ME_COOKIE] === '1';

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

/**
 * 清除 remember_me 偏好 cookie
 */
export const clearRememberMeCookie = (res: Response): void => {
  res.clearCookie(REMEMBER_ME_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
};
