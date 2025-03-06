import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { lambdaHandler as deleteHandler } from './handlers/delete-data';
import { lambdaHandler as insertHandler } from './handlers/insert-data';
import { lambdaHandler as updateHandler } from './handlers/update-data';
import { lambdaHandler as getAllHandler } from './handlers/get-all-data';

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
app.post('/insert', adaptLambdaHandler(insertHandler));
app.put('/update', adaptLambdaHandler(updateHandler));
app.delete('/delete', adaptLambdaHandler(deleteHandler));
export default app;
