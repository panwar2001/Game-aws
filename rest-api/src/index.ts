import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {DynamoDBDocumentClient, PutCommand, ScanCommand, DeleteCommand, QueryCommand} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME!;


export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult>  => {
  let statusCode = 200;
  let body: any;
  try {
    if (event.httpMethod === 'DELETE' && event.path === '/delete' && event.body) {

        const inputObj = typeof event.body === 'string' ?
         JSON.parse(event.body) as GameInputType : (event.body as GamePlayerIdType);
        
        await deleteData(inputObj.game_id, inputObj.player_id);
        body = `Deleted item ${inputObj}`;
        
    } else if (event.httpMethod === 'POST' && event.path === '/get-by-id' && event.body) {
        const inputObj = typeof event.body === 'string' ?
         JSON.parse(event.body) as GamePlayerIdType : (event.body as GamePlayerIdType);
        
        body = await getItemsByGameIdAndPlayerId(inputObj.game_id, inputObj.player_id);
    } else if (event.httpMethod === 'GET' && event.path === '/get') {
        body = await getAllItems();
    } else if (event.httpMethod === 'POST' && event.path === '/insert' && event.body) {
        const inputObj = typeof event.body === 'string' ? JSON.parse(event.body) as GameInputType : (event.body as GameInputType);
        await insertData(inputObj);
        body = `Put item ${inputObj}`;
    }
  } catch (err: any) {
    console.error('Error:', err);
    statusCode = 400;
    body = err;
  } finally {
    return {
        statusCode: statusCode,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*', // DO NOT USE IN PRODUCTION
          }
    };
  }
};




const getAllItems = async () => {
    const data = await dynamo.send(new ScanCommand({ TableName: tableName }));
    return data.Items || [];
};



// Function to insert data into DynamoDB
const insertData = async (input: GameInputType) => {
  await dynamo.send(
      new PutCommand({
          TableName: tableName,
          Item: input
      })
  );
  console.log('Success - item added or updated');
};


// Function to delete data from DynamoDB
const deleteData = async ( game_id: string, player_id: string) => {
  await dynamo.send(
      new DeleteCommand({
          TableName: tableName,
          Key: { game_id, player_id }
      })
  );
  console.log('Success - item deleted');
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

  const data = await dynamo.send(new QueryCommand(params));
  return data.Items || [];
};



interface GamePlayerIdType {
  game_id: string;
  player_id: string;
}
interface GameInputType {
  game_id: string;
  player_id: string;
  date: string;
  top_score: string;
}
