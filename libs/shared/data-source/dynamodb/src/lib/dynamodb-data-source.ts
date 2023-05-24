import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoKeyPair } from './types/dynamodb-types';
import { error } from 'console';

export class DynamoDBDataSource {
  private readonly client: DynamoDBDocumentClient;

  constructor(private readonly tableName: string) {
    this.client = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }

  public async put(
    keys: DynamoKeyPair,
    item: Record<string, unknown>
  ): Promise<boolean> {
    try {
      await this.client.send(
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

      return true;
    } catch (error) {
      console.warn(error);
      throw new Error(`Failed to upload to Dynamodb`);
    }
  }

  public async get(primaryKey: string): Promise<Record<string, unknown>[]> {
    try {
      const result = await this.client.send(
        new QueryCommand({
          TableName: this.tableName,
          ExpressionAttributeValues: {
            ':s': primaryKey,
          },
          KeyConditionExpression: `id = :s`,
        })
      );

      return result.Items;
    } catch (error) {
      console.warn(error);
      throw new Error(`Failed to get from Dynamodb`);
    }
  }
}
