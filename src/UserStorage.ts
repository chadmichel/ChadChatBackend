import { TableClient, TableServiceClient } from '@azure/data-tables';

export class UserStorage {
  private connectionString: string;
  constructor(connectionString) {
    this.connectionString = connectionString;
  }

  createTableServiceClient(): TableServiceClient {
    const client = TableServiceClient.fromConnectionString(
      this.connectionString
    );
    return client;
  }

  createTableClient(tableName: string): TableClient {
    const tableClient = TableClient.fromConnectionString(
      this.connectionString,
      tableName
    );
    return tableClient;
  }

  saveUser(email, userId) {
    const tableClient = this.createTableClient('users');
    tableClient.createEntity({
      partitionKey: email,
      rowKey: userId,
    });
  }

  async getUserIdByEmail(email) {
    const tableClient = this.createTableClient('users');
    const query = `PartitionKey eq '${email}'`;
    const result = tableClient.listEntities({
      queryOptions: { filter: query },
    });
    for await (const entity of result) {
      return entity.rowKey;
    }
    return null;
  }
}
