import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

// DynamoDB Configuration
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const tableName = process.env.TABLE_NAME!;

// Define the InputObject interface
interface InputObject {
    game_id: string;
    player_id: string;
}

export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    console.info('Received event:', event);
    
    // Parse body if it is in JSON format
    let input: InputObject;
    try {
        if (!event.body) throw new Error('Request body is missing.');
        input = JSON.parse(event.body!); // Parsing request body
        input = typeof event.body === 'string'? JSON.parse(event.body) as InputObject: (event.body as InputObject);

        validateInput(input);
    } catch (err:any) {
        return createResponse(400, {
            error: 'Invalid request body format',
            details: err.message
        });
    }
    
    try {
        const items = await getItemsByGameIdAndPlayerId(input.game_id, input.player_id);
        return createResponse(200, { message: 'Success', data: items });
    } catch (err: any) {
        console.error('DynamoDB Query Error:', err);
        return createResponse(500, { error: 'Database operation failed', details: err.message });
    }
};

// Function to query items by game_id and player_id from DynamoDB
const getItemsByGameIdAndPlayerId = async (gameId: string, playerId: string) => {
    const params = {
        TableName: tableName,
        KeyConditionExpression: 'game_id = :gameId AND player_id = :playerId',
        ExpressionAttributeValues: {
            ':gameId': gameId,
            ':playerId': playerId,
        },
    };

    const data = await ddbDocClient.send(new QueryCommand(params));
    return data.Items || [];
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
        'Access-Control-Allow-Origin': '*',
    };
    return {
        statusCode: statusCode,
        body: JSON.stringify(body),
        headers: headers,
    };
};
