import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoClient } from '@whatchangedfor/shared/dynamodb';

@Injectable()
export class S3StorageService {
  private readonly dynamoClient: DynamoClient;

  constructor(private readonly configService: ConfigService) {
    this.dynamoClient = new DynamoClient(
      this.configService.get<string>(`DYNAMODB_TABLE`)
    );
  }
}
