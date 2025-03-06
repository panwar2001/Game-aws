import { lambdaHandler } from '../src/handlers/get-all-data'; // Adjust path as necessary
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Mock DynamoDB Client Setup
const mockSend = jasmine.createSpy('send');
const mockDynamoDBDocumentClient = jasmine.createSpyObj('DynamoDBDocumentClient', ['send']);
mockDynamoDBDocumentClient.send = mockSend;

// Mock Data
const mockData = { Items: [{ game_id: 1, player_id: 'player1' }] };

describe('lambdaHandler', () => {
    let event: APIGatewayEvent;

    beforeAll(() => {
        // Set the environment variable TABLE_NAME before tests
        process.env.TABLE_NAME = 'TestTable';
    });

    beforeEach(() => {
        // Initialize event object for a GET request
        event = {
            httpMethod: 'GET',
            body: null,
            path: '/items',
            headers: {
                'Content-Type': 'application/json',
            },
            isBase64Encoded: false,
        } as any;  // Type casting to fit the interface
    });

    it('should return 200 with data on successful retrieval', async () => {
        // Simulate successful DynamoDB Scan operation
        mockSend.and.returnValue(Promise.resolve(mockData));

        // Inject mock client to lambdaHandler - assume lambdaHandler uses the mock client
        const result: APIGatewayProxyResult = await lambdaHandler(event);

        // Verify response
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body).message).toBe('Success');
        expect(JSON.parse(result.body).data).toEqual(mockData.Items);
    });

    it('should return 500 on error', async () => {
        // Simulate an error during the scan
        mockSend.and.returnValue(Promise.reject(new Error('Scan failed')));

        // Inject mock client to lambdaHandler - assume lambdaHandler uses the mock client
        const result: APIGatewayProxyResult = await lambdaHandler(event);

        // Verify error response
        expect(result.statusCode).toBe(500);
        expect(JSON.parse(result.body).error).toBe('Database operation failed');
    });
});
