import { TableClient, TableServiceClient } from '@azure/data-tables';

export class UserStorage {
  private connectionString: string;
  private userTableName = 'users';

  constructor(connectionString) {
    this.connectionString = connectionString;
  }

  createTableClient(tableName: string): TableClient {
    const tableClient = TableClient.fromConnectionString(
      this.connectionString,
      tableName
    );
    return tableClient;
  }

  saveUser(email, userId) {
    const tableClient = this.createTableClient(this.userTableName);
    tableClient.createEntity({
      partitionKey: email,
      rowKey: userId,
    });
  }

  async getUserIdByEmail(email) {
    const tableClient = this.createTableClient(this.userTableName);
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
