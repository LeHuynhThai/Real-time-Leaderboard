namespace Repository.Interfaces
{
    public interface IDataSeeder
    {
        Task<bool> HasDataAsync();
        Task SeedAsync(int count);
    }
}
