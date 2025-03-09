import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// DynamoDB Configuration
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const tableName = process.env.TABLE_NAME!; // Ensure TABLE_NAME is set

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    console.info('Received event:', event);
    
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
    const headers = {
        "Content-Type": "application/json",
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': '*', // DO NOT USE IN PRODUCTION
      };
    return {
        statusCode:statusCode,
        body:JSON.stringify(body),
        headers: headers,
    };
};
