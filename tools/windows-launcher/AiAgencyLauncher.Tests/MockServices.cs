namespace AiAgencyLauncher.Tests;

public class MockDockerCommandService : IDockerCommandService
{
    public bool Installed { get; set; } = true;
    public bool EngineRunning { get; set; } = true;
    public bool ComposeAvailable { get; set; } = true;
    public bool ComposeUpResult { get; set; } = true;
    public bool ComposeDownResult { get; set; } = true;
    public string ComposePsOutput { get; set; } = "container running";
    public string ComposeLogsOutput { get; set; } = "log output";

    public Task<bool> CheckDockerInstalled() => Task.FromResult(Installed);
    public Task<bool> CheckDockerEngineRunning() => Task.FromResult(EngineRunning);
    public Task<bool> CheckDockerComposeAvailable() => Task.FromResult(ComposeAvailable);
    public async Task<bool> RunComposeUp(string projectRoot, CancellationToken ct)
    {
        await Task.Yield();
        return ComposeUpResult;
    }
    public Task<bool> RunComposeDown(string projectRoot, CancellationToken ct) => Task.FromResult(ComposeDownResult);
    public Task<string> RunComposePs(string projectRoot, CancellationToken ct) => Task.FromResult(ComposePsOutput);
    public Task<string> RunComposeLogs(string projectRoot, CancellationToken ct) => Task.FromResult(ComposeLogsOutput);
}

public class MockHealthCheckService : IHealthCheckService
{
    public bool Healthy { get; set; } = true;

    public Task<bool> CheckHttpAsync(string url, int timeoutMs) => Task.FromResult(Healthy);
}

public class MockBrowserLauncher : IBrowserLauncher
{
    public int OpenCount { get; private set; }
    public string? LastUrl { get; private set; }

    public void OpenUrl(string url)
    {
        OpenCount++;
        LastUrl = url;
    }
}
