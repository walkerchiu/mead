import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 中間件:在請求處理之前捕獲原始的 req.body
 * 這樣可以確保在 GraphQL 解析之前就保存了完整的請求資料
 */
@Injectable()
export class CaptureOriginalBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 深度複製 req.body 到 req._originalBody (在 GraphQL 處理之前)
    if (req.body) {
      (req as any)._originalBody = JSON.parse(JSON.stringify(req.body));
    }
    next();
  }
}
