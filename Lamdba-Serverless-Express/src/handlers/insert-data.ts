import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

// DynamoDB Configuration
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const tableName = process.env.TABLE_NAME!; // Ensure TABLE_NAME is set

interface InputObject {
    game_id: number;
    player_id: string;
    date: string;
    top_score: number;
}

export const lambdaHandler = async (
    event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
    console.info('Received event:', event);

    // Validate HTTP method
    if (event.httpMethod !== 'PUT') {
        return createResponse(405, {
            error: `Method Not Allowed. Expected 'PUT', received '${event.httpMethod}'.`
        });
    }

    // Parse and validate input
    let inputObj: InputObject;
    try {
        if (!event.body) throw new Error('Request body is missing.');

        inputObj = typeof event.body === 'string'? JSON.parse(event.body) as InputObject: (event.body as InputObject);

        validateInput(inputObj);
    } catch (err: any) {
        return createResponse(400, {
            error: 'Invalid JSON or missing attributes: game_id, player_id, date, top_score',
            details: err.message
        });
    }

    // Insert data into DynamoDB
    try {
        await insertData(inputObj);
        return createResponse(200, { message: 'Success - item added or updated' });
    } catch (err: any) {
        console.error('DynamoDB Insert Error:', err);
        return createResponse(500, { error: 'Database operation failed', details: err.message });
    }
};

// Function to insert data into DynamoDB
const insertData = async (inputObj: InputObject) => {
    await ddbDocClient.send(
        new PutCommand({
            TableName: tableName,
            Item: inputObj 
        })
    );
    console.log('Success - item added or updated');
};

// Function to validate input attributes
const validateInput = (input: InputObject) => {
    if (!input.game_id || !input.player_id || !input.date || !input.top_score) {
        throw new Error('Missing required attributes: game_id, player_id, date, top_score');
    }
};

// Helper function to create a structured API response
const createResponse = (statusCode: number, body: object): APIGatewayProxyResult => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*', // DO NOT USE IN PRODUCTION
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT'
        },
        body: JSON.stringify(body)
    };
};
