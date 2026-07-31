using System.Diagnostics;

namespace AiAgencyLauncher;

public interface IDockerCommandService
{
    Task<bool> CheckDockerInstalled();
    Task<bool> CheckDockerEngineRunning();
    Task<bool> CheckDockerComposeAvailable();
    Task<bool> RunComposeUp(string projectRoot, CancellationToken ct);
    Task<bool> RunComposeDown(string projectRoot, CancellationToken ct);
    Task<string> RunComposePs(string projectRoot, CancellationToken ct);
    Task<string> RunComposeLogs(string projectRoot, CancellationToken ct);
}

public class DockerCommandService : IDockerCommandService
{
    private readonly LauncherLogger _log;

    public DockerCommandService(LauncherLogger log)
    {
        _log = log;
    }

    public async Task<bool> CheckDockerInstalled()
    {
        try
        {
            var result = await RunProcessAsync("docker", "--version", CancellationToken.None);
            return result.ExitCode == 0;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> CheckDockerEngineRunning()
    {
        try
        {
            var result = await RunProcessAsync("docker", "info", CancellationToken.None, timeoutMs: 10000);
            return result.ExitCode == 0;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> CheckDockerComposeAvailable()
    {
        try
        {
            var result = await RunProcessAsync("docker", "compose version", CancellationToken.None);
            return result.ExitCode == 0;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> RunComposeUp(string projectRoot, CancellationToken ct)
    {
        var result = await RunProcessAsync("docker", "compose up -d --build", projectRoot, ct, timeoutMs: 300000);
        return result.ExitCode == 0;
    }

    public async Task<bool> RunComposeDown(string projectRoot, CancellationToken ct)
    {
        var result = await RunProcessAsync("docker", "compose down", projectRoot, ct, timeoutMs: 60000);
        return result.ExitCode == 0;
    }

    public async Task<string> RunComposePs(string projectRoot, CancellationToken ct)
    {
        var result = await RunProcessAsync("docker", "compose ps", projectRoot, ct, timeoutMs: 15000);
        return result.Stdout;
    }

    public async Task<string> RunComposeLogs(string projectRoot, CancellationToken ct)
    {
        var result = await RunProcessAsync("docker", "compose logs --tail=50", projectRoot, ct, timeoutMs: 15000);
        return result.Stdout;
    }

    private async Task<ProcessResult> RunProcessAsync(string fileName, string arguments,
        CancellationToken ct, int timeoutMs = 30000)
    {
        return await RunProcessAsync(fileName, arguments, null, ct, timeoutMs);
    }

    private async Task<ProcessResult> RunProcessAsync(string fileName, string arguments,
        string? workingDirectory, CancellationToken ct, int timeoutMs = 30000)
    {
        var psi = new ProcessStartInfo
        {
            FileName = fileName,
            Arguments = arguments,
            UseShellExecute = false,
            CreateNoWindow = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            WorkingDirectory = workingDirectory ?? string.Empty,
        };

        using var process = new Process { StartInfo = psi };
        var stdout = new StringWriter();
        var stderr = new StringWriter();

        process.Start();

        var cancelSource = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cancelSource.CancelAfter(timeoutMs);

        var readTask = Task.Run(async () =>
        {
            var readStdout = process.StandardOutput.ReadToEndAsync();
            var readStderr = process.StandardError.ReadToEndAsync();
            await Task.WhenAll(readStdout, readStderr);
            stdout.Write(await readStdout);
            stderr.Write(await readStderr);
        }, cancelSource.Token);

        try
        {
            await process.WaitForExitAsync(cancelSource.Token);
            await readTask;
        }
        catch (OperationCanceledException)
        {
            if (!process.HasExited)
            {
                try { process.Kill(entireProcessTree: true); } catch { }
            }
            throw new TimeoutException($"Process '{fileName} {arguments}' timed out after {timeoutMs}ms");
        }

        return new ProcessResult(process.ExitCode, stdout.ToString(), stderr.ToString());
    }

    private record ProcessResult(int ExitCode, string Stdout, string Stderr);
}
