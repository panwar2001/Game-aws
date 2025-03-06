import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// DynamoDB Configuration
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const tableName = process.env.TABLE_NAME!; // Ensure TABLE_NAME is set

// Interface for input
interface InputObject {
    game_id: number;
    player_id: string;
    date?: string;
    top_score?: number;
}

export const lambdaHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
    console.info('Received event:', event);

    // Validate HTTP method
    if (event.httpMethod !== 'PUT') {
        return createResponse(405, { error: `Method Not Allowed. Expected 'PUT', received '${event.httpMethod}'.` });
    }

    // Parse and validate input
    let inputObj: Partial<InputObject> & { game_id: number; player_id: string };
    try {
        if (!event.body) throw new Error('Request body is missing.');
        inputObj = JSON.parse(event.body);

        validateInput(inputObj);
    } catch (err: any) {
        return createResponse(400, { error: 'Invalid input', details: err.message });
    }

    // Update data in DynamoDB
    try {
        await updateData(inputObj);
        return createResponse(200, { message: 'Success - item updated' });
    } catch (err: any) {
        console.error('DynamoDB Update Error:', err);
        return createResponse(500, { error: 'Database operation failed', details: err.message });
    }
};

// Function to update data in DynamoDB
const updateData = async (inputObj: Partial<InputObject> & { game_id: number; player_id: string }) => {
    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    
    if (inputObj.date) {
        updateExpressions.push('date = :date');
        expressionAttributeValues[':date'] = inputObj.date;
    }
    if (inputObj.top_score !== undefined) {
        updateExpressions.push('top_score = :top_score');
        expressionAttributeValues[':top_score'] = inputObj.top_score;
    }

    if (updateExpressions.length === 0) {
        throw new Error('No attributes to update. Provide at least one field.');
    }

    await ddbDocClient.send(
        new UpdateCommand({
            TableName: tableName,
            Key: { game_id: inputObj.game_id, player_id: inputObj.player_id },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'UPDATED_NEW'
        })
    );
};

// Function to validate input attributes
const validateInput = (input: Partial<InputObject> & { game_id: number; player_id: string }) => {
    if (!input.game_id || !input.player_id) {
        throw new Error('Missing required keys: game_id, player_id');
    }
    if (input.date === undefined && input.top_score === undefined) {
        throw new Error('Provide at least one field to update (date or top_score)');
    }
};

// Helper function to create API response
const createResponse = (statusCode: number, body: object): APIGatewayProxyResult => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*', // DO NOT USE IN PRODUCTION
            'Access-Control-Allow-Methods': 'OPTIONS,PUT'
        },
        body: JSON.stringify(body)
    };
};

