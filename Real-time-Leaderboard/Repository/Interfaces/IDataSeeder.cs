using Repository.Entities;

namespace Repository.Interfaces
{
    public interface IDataSeeder
    {
        Task SeedAsync(int count);
        Task ClearAllDataAsync();
    }
}
