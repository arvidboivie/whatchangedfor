import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

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
      dynamoDB.put({ id: 'kunkka', version: '7.33' }, {});

      expect(ddbMock).toHaveReceivedCommandWith(PutCommand, {
        TableName: tableName,
        Item: {
          id: `kunkka`,
          version: `7.33`,
          created_at: mockDate.toUTCString(),
        },
      });
    });
  });
});
