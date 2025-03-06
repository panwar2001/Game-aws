import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// DynamoDB Configuration
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const tableName = process.env.TABLE_NAME!; // Ensure TABLE_NAME is set

export const lambdaHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    console.info('Received event:', event);

    // Validate HTTP method
    if (event.httpMethod !== 'GET') {
        return createResponse(405, { error: `Method Not Allowed. Expected 'GET', received '${event.httpMethod}'.` });
    }

    try {
        const items = await getAllItems();
        return createResponse(200, { message: 'Success', data: items });
    } catch (err: any) {
        console.error('DynamoDB Scan Error:', err);
        return createResponse(500, { error: 'Database operation failed', details: err.message });
    }
};

// Function to fetch all items from DynamoDB
const getAllItems = async () => {
    const data = await ddbDocClient.send(new ScanCommand({ TableName: tableName }));
    return data.Items || [];
};

// Helper function to create API response
const createResponse = (statusCode: number, body: object): APIGatewayProxyResult => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*', // DO NOT USE IN PRODUCTION
            'Access-Control-Allow-Methods': 'OPTIONS,GET'
        },
        body: JSON.stringify(body)
    };
};
