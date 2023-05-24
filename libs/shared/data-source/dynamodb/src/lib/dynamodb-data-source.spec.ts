import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

import { DynamoDBDataSource } from './dynamodb-data-source';

describe('DynamoDBDataSource', () => {
  const mockDate = new Date(2013, 6, 9);
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);

  const ddbMock = mockClient(DynamoDBDocumentClient);
  const tableName = `mockTable`;
  const dynamoDB = new DynamoDBDataSource(tableName);

  beforeEach(() => {
    ddbMock.reset();
  });

  it('should work', () => {
    expect(dynamoDB).toBeDefined;
  });

  describe(`put`, () => {
    it('should call PutCommand', () => {
      const promise = dynamoDB.put({ id: 'kunkka', version: '7.33' }, {});

      expect(ddbMock).toHaveReceivedCommandWith(PutCommand, {
        TableName: tableName,
        Item: {
          id: `kunkka`,
          version: `7.33`,
          created_at: mockDate.toUTCString(),
        },
      });
      expect(promise).resolves.toBe(true);
    });

    it('should throw on rejection', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {
        /* skip warnings */
      });
      ddbMock.on(PutCommand).rejects(`Rejecting on purpose for test`);

      expect(
        dynamoDB.put({ id: 'kunkka', version: '7.33' }, {})
      ).rejects.toEqual(new Error(`Failed to upload to Dynamodb`));
    });
  });

  describe(`get`, () => {
    it('should return items', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [{ id: 'kunkka', version: '7.33' }],
      });

      const result = await dynamoDB.get('kunkka');

      expect(result).toEqual([{ id: 'kunkka', version: '7.33' }]);
      expect(ddbMock).toHaveReceivedCommand(QueryCommand);
    });

    it('should throw on rejection', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {
        /* skip warnings */
      });
      ddbMock.on(QueryCommand).rejects(`Rejecting on purpose for test`);

      expect(dynamoDB.get('kunkka')).rejects.toEqual(
        new Error(`Failed to get from Dynamodb`)
      );
    });
  });
});
