import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { serializeBigInt } from '../utils/bigint-serializer';

interface ControllerResponse {
    status?: string;
    message?: string;
    data?: any;
}

interface StandardResponse<T> {
    status: string;
    message: string;
    data: T | null;
}

@Injectable()
export class ResponseInterceptor<T>
    implements NestInterceptor<ControllerResponse, StandardResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<StandardResponse<T>> {
        return next.handle().pipe(
            map((controllerResponse: ControllerResponse) => ({
                status: controllerResponse.status || 'success',
                message: controllerResponse.message || 'Operation successful',
                data: controllerResponse.data ? serializeBigInt(controllerResponse.data) : null,
            })),
        );
    }
}
