import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  // Пути, которые нужно исключить из логирования (например, health checks)
  private readonly excludedPaths = ['/health', '/metrics'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, url, ip, headers, query } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    // Получаем реальный IP адрес (учитываем прокси через X-Forwarded-For)
    const realIp = headers['x-forwarded-for']?.toString().split(',')[0].trim() || ip || 'Unknown';
    const startTime = Date.now();

    // Проверяем, нужно ли логировать этот путь
    const shouldLog = !this.excludedPaths.some((path) => url.includes(path));

    if (!shouldLog) {
      return next.handle();
    }

    // Формируем строку с query параметрами
    const queryString = Object.keys(query).length > 0
      ? `?${new URLSearchParams(query as Record<string, string>).toString()}`
      : '';
    const fullUrl = url + queryString;

    // Логируем входящий запрос
    this.logger.log(
      `→ ${method} ${fullUrl} | IP: ${realIp} | User-Agent: ${userAgent.substring(0, 80)}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          const contentLengthHeader = response.get('content-length');
          const contentLength = contentLengthHeader
            ? Number(contentLengthHeader)
            : 0;

          // Определяем эмодзи для статуса
          let statusEmoji = '✅';
          if (statusCode >= 400 && statusCode < 500) {
            statusEmoji = '⚠️';
          } else if (statusCode >= 500) {
            statusEmoji = '❌';
          }

          // Форматируем размер ответа
          const sizeStr = contentLength
            ? contentLength > 1024
              ? `${(contentLength / 1024).toFixed(2)}KB`
              : `${contentLength}B`
            : '0B';

          this.logger.log(
            `${statusEmoji} ${method} ${fullUrl} | ${statusCode} | ${duration}ms | ${sizeStr} | IP: ${realIp}`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.logger.error(
            `❌ ${method} ${fullUrl} | ${statusCode} | ${duration}ms | IP: ${realIp} | Error: ${error.message || error}`,
          );
        },
      }),
    );
  }
}

