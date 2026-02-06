import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const RequestId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = context.getType<'graphql' | 'http'>();

    if (ctx === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const { req } = gqlContext.getContext();
      return req.requestId;
    }

    const request = context.switchToHttp().getRequest();
    return request.requestId;
  },
);
