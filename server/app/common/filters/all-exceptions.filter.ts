// src/common/filters/all-exceptions.filter.ts
import { Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: HttpException, response) {
        const status = exception.getStatus();
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: response.req.url,
        });
    }
}