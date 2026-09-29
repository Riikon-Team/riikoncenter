import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorType = 'InternalServerError';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse() as any;
      
      message = res.message || res;
      errorType = res.error || exception.name;
    } else if (this.isPrismaError(exception)) {
      // Prisma Error Fallbacks
      const prismaError = this.handlePrismaError(exception);
      statusCode = prismaError.statusCode;
      message = prismaError.message;
      errorType = prismaError.errorType;
    } else if (exception instanceof Error) {
      // Generic Unhandled Error Fallback
      message = exception.message;
      errorType = exception.name;
    }

    // Log the error for internal tracking (only log full stack for 500s)
    if (statusCode === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`[${request.method}] ${request.url} - ${exception instanceof Error ? exception.stack : exception}`);
    } else {
      this.logger.warn(`[${request.method}] ${request.url} - ${statusCode} - ${Array.isArray(message) ? message.join(', ') : message}`);
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error: errorType,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private isPrismaError(exception: any): boolean {
    return exception && exception.constructor && exception.constructor.name.startsWith('PrismaClient');
  }

  private handlePrismaError(exception: any) {
    // PrismaClientKnownRequestError
    if (exception.code) {
      switch (exception.code) {
        case 'P2002': // Unique constraint failed
          return {
            statusCode: HttpStatus.CONFLICT,
            message: `Unique constraint failed on the fields: (${exception.meta?.target?.join(', ') || 'unknown'})`,
            errorType: 'ConflictError',
          };
        case 'P2025': // Record not found
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Record not found',
            errorType: 'NotFoundError',
          };
        case 'P2003': // Foreign key constraint failed
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Foreign key constraint failed',
            errorType: 'BadRequestError',
          };
        default:
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Database error: ${exception.message.split('\\n').pop()}`,
            errorType: 'DatabaseError',
          };
      }
    }
    
    // Fallback for unknown Prisma errors
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database query failed',
      errorType: 'DatabaseError',
    };
  }
}
