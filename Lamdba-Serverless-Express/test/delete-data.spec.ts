// import { lambdaHandler } from '../src/handlers/delete-data';  // Import the lambda handler function
// import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

// // Mocks for DynamoDB operations
// const mockDeleteCommand = jasmine.createSpyObj('DeleteCommand', ['send']);
// const mockDynamoDBDocumentClient = jasmine.createSpyObj('DynamoDBDocumentClient', ['send']);

// describe('lambdaHandler', () => {
//     let event: APIGatewayEvent;

//     beforeEach(() => {
//         // Initializing event object for DELETE requests
//         event = {
//             body: JSON.stringify({
//                 game_id: 1,
//                 player_id: 'player1',
//             }),
//             httpMethod: 'DELETE',
//             path: '/game/score',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             isBase64Encoded: false,
//         } as any;  // Type casting to fit the interface
//     });

//     it('should return 200 on successful item deletion', async () => {
//         // Simulate successful DynamoDB DELETE operation
//         mockDeleteCommand.send.and.returnValue(Promise.resolve({}));

//         // Mock the dynamo client
//         mockDynamoDBDocumentClient.send = mockDeleteCommand.send;

//         // Call the lambda handler
//         const result: APIGatewayProxyResult = await lambdaHandler(event);

//         // Check the returned response
//         expect(result.statusCode).toBe(200);
//         expect(JSON.parse(result.body).message).toBe('Success - item deleted');
//     });

//     it('should return 400 if request body is missing or invalid', async () => {
//         // Invalid body (missing or incorrect format)
//         event.body = '';  // Empty body to simulate missing input

//         const result: APIGatewayProxyResult = await lambdaHandler(event);

//         expect(result.statusCode).toBe(400);
//         expect(JSON.parse(result.body).error).toBe('Invalid JSON or missing attributes: game_id, player_id');
//     });

//     it('should return 405 for non-DELETE requests', async () => {
//         // Change the HTTP method to simulate a non-DELETE request
//         event.httpMethod = 'GET';

//         const result: APIGatewayProxyResult = await lambdaHandler(event);

//         expect(result.statusCode).toBe(405);
//         expect(JSON.parse(result.body).error).toBe("Method Not Allowed. Expected 'DELETE', received 'GET'.");
//     });

//     it('should return 500 when DynamoDB operation fails', async () => {
//         // Simulate a DynamoDB DELETE failure (e.g., network error, permission issue)
//         mockDeleteCommand.send.and.returnValue(Promise.reject(new Error('DynamoDB error')));

//         // Mock the dynamo client
//         mockDynamoDBDocumentClient.send = mockDeleteCommand.send;

//         const result: APIGatewayProxyResult = await lambdaHandler(event);

//         expect(result.statusCode).toBe(500);
//         expect(JSON.parse(result.body).error).toBe('Database operation failed');
//     });

//     it('should return 400 if input data is missing attributes', async () => {
//         const invalidEvent = {
//             ...event,
//             body: JSON.stringify({
//                 game_id: 1,
//                 // Missing player_id
//             })
//         };

//         const result: APIGatewayProxyResult = await lambdaHandler(invalidEvent);

//         expect(result.statusCode).toBe(400);
//         expect(JSON.parse(result.body).error).toBe('Invalid JSON or missing attributes: game_id, player_id');
//     });

//     it('should call the deleteData function with the correct parameters', async () => {
//         // Set up spy to mock the deleteData function
//         const deleteDataSpy = spyOn<any>(lambdaHandler.prototype, 'deleteData').and.callFake(async () => {});

//         // Simulate successful DynamoDB DELETE operation
//         mockDeleteCommand.send.and.returnValue(Promise.resolve({}));
//         mockDynamoDBDocumentClient.send = mockDeleteCommand.send;

//         // Call the lambda handler
//         await lambdaHandler(event);

//         // Verify the deleteData method was called with the correct arguments
//         expect(deleteDataSpy).toHaveBeenCalledWith(1, 'player1');
//     });
// });
