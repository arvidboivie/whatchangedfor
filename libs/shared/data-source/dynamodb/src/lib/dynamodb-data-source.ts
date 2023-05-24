import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoKeyPair } from './types/dynamodb-types';

export class DynamoDBDataSource {
  private readonly client: DynamoDBDocumentClient;

  constructor(private readonly tableName: string) {
    this.client = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }

  public async put(keys: DynamoKeyPair, item: Record<string, unknown>) {
    return this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          id: keys.id,
          version: keys.version,
          ...item,
          created_at: new Date().toUTCString(),
        },
      })
    );
  }
}
