import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

const SUPPORTED_LOCALES = ['en', 'zh-TW'];

const parseAcceptLanguage = (header?: string): string => {
  if (!header) return 'en';
  const primary = header.split(',')[0]?.trim();
  if (!primary) return 'en';
  if (SUPPORTED_LOCALES.includes(primary)) return primary;
  const prefix = primary.split('-')[0];
  if (prefix === 'zh') return 'zh-TW';
  return SUPPORTED_LOCALES.includes(prefix) ? prefix : 'en';
};

export const I18nLang = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    if (ctx.getType().toString() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(ctx);
      const req = gqlCtx.getContext().req;
      return (
        req?.headers?.['x-lang'] ||
        parseAcceptLanguage(req?.headers?.['accept-language'])
      );
    }
    const req = ctx.switchToHttp().getRequest();
    return (
      req?.headers?.['x-lang'] ||
      parseAcceptLanguage(req?.headers?.['accept-language'])
    );
  },
);
