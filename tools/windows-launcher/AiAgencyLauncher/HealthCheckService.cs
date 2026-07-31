using System.Net;

namespace AiAgencyLauncher;

public interface IHealthCheckService
{
    Task<bool> CheckHttpAsync(string url, int timeoutMs);
}

public class HealthCheckService : IHealthCheckService
{
    private readonly HttpClient _client;

    public HealthCheckService()
    {
        _client = new HttpClient();
    }

    public async Task<bool> CheckHttpAsync(string url, int timeoutMs)
    {
        using var cts = new CancellationTokenSource(timeoutMs);
        try
        {
            var response = await _client.GetAsync(url, cts.Token);
            return response.StatusCode == HttpStatusCode.OK;
        }
        catch
        {
            return false;
        }
    }
}
