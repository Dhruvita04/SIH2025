"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const response_interceptor_1 = require("./interceptors/response.interceptor");
const bodyParser = require("body-parser");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    const port = process.env.PORT || 7000;
    await app.listen(port, "0.0.0.0");
    const server = app.getHttpServer();
    const address = server.address();
    const domain = typeof address === 'string' ? address : `http://${address.address}:${address.port}/api/v1`;
    console.log(`Server is running on ${domain}`);
}
bootstrap();
//# sourceMappingURL=main.js.map