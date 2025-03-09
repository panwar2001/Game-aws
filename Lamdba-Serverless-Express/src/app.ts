import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import { handler as deleteHandler } from './handlers/delete-data';
import { handler as insertHandler } from './handlers/put-data';
import { handler as getAllHandler } from './handlers/get-data';
import { handler as getByIdHandler } from './handlers/get-data-by-id';

const app = express();
app.use(express.json());

// Convert Express request/response to API Gateway event format
const adaptLambdaHandler = (lambdaHandler: any) => async (req: express.Request, res: express.Response) => {
    const event = {
        httpMethod: req.method,
        path: req.path,
        queryStringParameters: req.query,
        headers: req.headers,
        body: req.body ? JSON.stringify(req.body) : null
    };
    const response = await lambdaHandler(event);
    res.status(response.statusCode).json(JSON.parse(response.body));
};
// Attach Lambda handlers to Express routes
app.get('/get', adaptLambdaHandler(getAllHandler));
app.post('/get-by-id', adaptLambdaHandler(getByIdHandler));
app.post('/insert', adaptLambdaHandler(insertHandler));
app.delete('/delete', adaptLambdaHandler(deleteHandler));
export default app;
