import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
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
export declare class ResponseInterceptor<T> implements NestInterceptor<ControllerResponse, StandardResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>>;
}
export {};
