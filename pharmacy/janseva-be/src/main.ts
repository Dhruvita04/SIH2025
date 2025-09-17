import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    // origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }); // Enable CORS
  app.setGlobalPrefix('api/v1');

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Apply the interceptor globally
  app.useGlobalInterceptors(new ResponseInterceptor());


  const port = process.env.PORT || 7000;
  await app.listen(port, "0.0.0.0");

  const server = app.getHttpServer();
  const address = server.address();
  const domain = typeof address === 'string' ? address : `http://${address.address}:${address.port}/api/v1`;


  // // Increase payload size limit for JSON
  // app.use(bodyParser.json({ limit: '50mb' }));
  // app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  console.log(`Server is running on ${domain}`);
}


bootstrap();
