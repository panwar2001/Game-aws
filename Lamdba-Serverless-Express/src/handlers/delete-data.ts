import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';

// DynamoDB Configuration
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const tableName = process.env.TABLE_NAME!; // Ensure TABLE_NAME is set


// Define the InputObject interface
interface InputObject {
    game_id: string;
    player_id: string;
}

export const handler = async (
    event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
    console.info('Received event:', event);

    // Parse and validate input
    let inputObj:InputObject;
    try {
        if (!event.body) throw new Error('Request body is missing.');
        inputObj = JSON.parse(event.body!); // Parsing request body
        inputObj = typeof event.body === 'string'? JSON.parse(event.body) as InputObject: (event.body as InputObject);

        validateInput(inputObj);
    } catch (err: any) {
        return createResponse(400, {
            error: 'Invalid JSON or missing attributes: game_id, player_id',
            details: err.message
        });
    }

    // Delete item from DynamoDB
    try {
        await deleteData(inputObj.game_id, inputObj.player_id);
        return createResponse(200, { message: 'Success - item deleted' });
    } catch (err: any) {
        console.error('DynamoDB Delete Error:', err);
        return createResponse(500, { error: 'Database operation failed', details: err.message });
    }
};

// Function to delete data from DynamoDB
const deleteData = async (game_id: string, player_id: string) => {
    await ddbDocClient.send(
        new DeleteCommand({
            TableName: tableName,
            Key: { game_id, player_id }
        })
    );
    console.log('Success - item deleted');
};

// Function to validate input attributes
const validateInput = (input: { game_id: string; player_id: string }) => {
    if (!input.game_id || !input.player_id) {
        throw new Error('Missing required attributes: game_id, player_id');
    }
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