import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

export class DynamoClient {
  private readonly client: DynamoDBDocumentClient;

  constructor(private readonly TableName: string) {
    this.client = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }

  public async put(id: string, version: string, item: Record<string, unknown>) {
    return this.client.send(
      new PutCommand({
        TableName: this.TableName,
        Item: {
          id,
          version,
          ...item,
          created_at: new Date().toUTCString(),
        },
      })
    );
  }

  public async get(id: string) {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.TableName,
        ExpressionAttributeValues: {
          ':s': id,
        },
        KeyConditionExpression: `id = :s`,
      })
    );

    return result.Items;
  }
}
