using StackExchange.Redis;

namespace Repository.Redis
{
    public interface IRedisConnectionManager
    {
        IDatabase GetDatabase();
        IConnectionMultiplexer GetConnection();
    }

    public class RedisConnectionManager : IRedisConnectionManager, IDisposable
    {
        private readonly IConnectionMultiplexer _connection;
        private readonly IDatabase _database;

        public RedisConnectionManager(string connectionString)
        {
            _connection = ConnectionMultiplexer.Connect(connectionString);
            _database = _connection.GetDatabase();
        }

        public IDatabase GetDatabase()
        {
            return _database;
        }

        public IConnectionMultiplexer GetConnection()
        {
            return _connection;
        }

        public void Dispose()
        {
            _connection?.Dispose();
        }
    }
}
