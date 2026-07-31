namespace AiAgencyLauncher;

public class LauncherApplication
{
    private readonly LauncherOptions _options;
    private readonly LauncherLogger _log;
    private readonly ProjectPathResolver _pathResolver;
    private readonly IDockerCommandService _dockerCommand;
    private readonly IDockerHealthService _dockerHealth;
    private readonly IHealthCheckService _healthCheck;
    private readonly IBrowserLauncher _browser;
    private string _projectRoot = string.Empty;
    private bool _browserOpened;

    private static readonly SemaphoreSlim _startLock = new(1, 1);

    public LauncherApplication(
        LauncherOptions options,
        LauncherLogger log,
        ProjectPathResolver pathResolver,
        IDockerCommandService dockerCommand,
        IDockerHealthService dockerHealth,
        IHealthCheckService healthCheck,
        IBrowserLauncher browser)
    {
        _options = options;
        _log = log;
        _pathResolver = pathResolver;
        _dockerCommand = dockerCommand;
        _dockerHealth = dockerHealth;
        _healthCheck = healthCheck;
        _browser = browser;
    }

    public async Task<LauncherExitCode> RunAsync(CancellationToken ct)
    {
        try
        {
            _projectRoot = _pathResolver.FindProjectRoot();
        }
        catch (FileNotFoundException ex)
        {
            _log.Error(ex.Message);
            return LauncherExitCode.ComposeFileNotFound;
        }

        try
        {
            ProjectPathResolver.FindEnvFile(_projectRoot);
        }
        catch (FileNotFoundException ex)
        {
            _log.Error(ex.Message);
            return LauncherExitCode.EnvFileNotFound;
        }

        _log.Info($"Project root: {_projectRoot}");
        _log.Info(string.Empty);

        switch (_options.Mode)
        {
            case LauncherMode.Start:
                return await StartAsync(ct);
            case LauncherMode.Stop:
                return await StopAsync(ct);
            case LauncherMode.Restart:
                return await RestartAsync(ct);
            case LauncherMode.Status:
                return await ShowStatusAsync(ct);
            case LauncherMode.Logs:
                return await ShowLogsAsync(ct);
            default:
                return LauncherExitCode.UnknownError;
        }
    }

    private async Task<LauncherExitCode> StartAsync(CancellationToken ct)
    {
        if (!await _startLock.WaitAsync(0))
        {
            _log.Error("Another launcher instance is already starting the system.");
            return LauncherExitCode.UnknownError;
        }

        try
        {
            var checkResult = await RunPreflightChecks(ct);
            if (checkResult != LauncherExitCode.Success)
                return checkResult;

            _log.Step("START", "Docker Compose");
            var upOk = await _dockerCommand.RunComposeUp(_projectRoot, ct);
            if (!upOk)
            {
                _log.CheckFail("Docker Compose up");
                _log.Hint("Run 'docker compose logs' for details. Check if ports are already in use.");
                return LauncherExitCode.ComposeUpFailed;
            }
            _log.CheckOk("Docker Compose up");

            var healthOk = await WaitForAllServices(ct);
            if (!healthOk)
            {
                _log.Hint("Run --logs to see container output. Ensure .env has valid configuration.");
                return LauncherExitCode.HealthCheckTimeout;
            }

            _log.Info(string.Empty);
            var color = Console.ForegroundColor;
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("[SUCCESS] AI AGENCY SIMULATOR STARTED");
            Console.ForegroundColor = color;
            Console.WriteLine("  Dashboard:  http://localhost");
            Console.WriteLine("  API:        http://localhost:3000");
            Console.WriteLine(string.Empty);
            _log.Hint("Press Ctrl+C to exit (containers keep running). Use --stop to shut down.");

            if (_options.OpenBrowser && !_browserOpened)
            {
                _browser.OpenUrl("http://localhost");
                _browserOpened = true;
            }

            return LauncherExitCode.Success;
        }
        finally
        {
            _startLock.Release();
        }
    }

    private async Task<LauncherExitCode> StopAsync(CancellationToken ct)
    {
        _log.Step("STOP", "Docker Compose");
        var ok = await _dockerCommand.RunComposeDown(_projectRoot, ct);
        if (!ok)
        {
            _log.CheckFail("Docker Compose down");
            return LauncherExitCode.UnknownError;
        }
        _log.CheckOk("Docker Compose down");
        _log.Success("AI AGENCY SIMULATOR STOPPED");
        return LauncherExitCode.Success;
    }

    private async Task<LauncherExitCode> RestartAsync(CancellationToken ct)
    {
        var stopResult = await StopAsync(ct);
        if (stopResult != LauncherExitCode.Success)
            return stopResult;

        _log.Info(string.Empty);
        return await StartAsync(ct);
    }

    private async Task<LauncherExitCode> ShowStatusAsync(CancellationToken ct)
    {
        _log.Step("STATUS", "Docker Compose");
        var ps = await _dockerCommand.RunComposePs(_projectRoot, ct);
        Console.WriteLine(ps);

        if (string.IsNullOrWhiteSpace(ps) || ps.Contains("Exit") || ps.Contains("exited"))
        {
            _log.Error("Some containers are not running.");
            return LauncherExitCode.UnknownError;
        }

        _log.Success("All containers are running.");
        return LauncherExitCode.Success;
    }

    private async Task<LauncherExitCode> ShowLogsAsync(CancellationToken ct)
    {
        _log.Step("LOGS", "Docker Compose");
        var logs = await _dockerCommand.RunComposeLogs(_projectRoot, ct);
        Console.WriteLine(logs);
        return LauncherExitCode.Success;
    }

    private async Task<LauncherExitCode> RunPreflightChecks(CancellationToken ct)
    {
        _log.Step("CHECK", "Docker");
        var dockerInstalled = await _dockerHealth.IsDockerInstalled();
        if (!dockerInstalled)
        {
            _log.CheckFail("Docker");
            _log.Hint("Install Docker Desktop from https://www.docker.com/products/docker-desktop/");
            return LauncherExitCode.DockerNotInstalled;
        }
        _log.CheckOk("Docker");

        var engineRunning = await _dockerHealth.IsEngineRunning();
        if (!engineRunning)
        {
            _log.CheckFail("Docker Engine");
            _log.Hint("Start Docker Desktop and wait for the engine to be ready.");
            return LauncherExitCode.DockerEngineNotRunning;
        }
        _log.CheckOk("Docker Engine");

        var composeAvailable = await _dockerHealth.IsComposeAvailable();
        if (!composeAvailable)
        {
            _log.CheckFail("Docker Compose");
            _log.Hint("Docker Compose is built into Docker Desktop. Ensure you have the latest version.");
            return LauncherExitCode.DockerComposeNotAvailable;
        }
        _log.CheckOk("Docker Compose");

        _log.Info(string.Empty);
        return LauncherExitCode.Success;
    }

    private async Task<bool> WaitForAllServices(CancellationToken ct)
    {
        var services = new[]
        {
            ("API Gateway", "http://localhost:3000/api/health"),
            ("Auth Service", "http://localhost:3003/health"),
            ("Agent Service", "http://localhost:3002/health"),
            ("Web Dashboard", "http://localhost:80/"),
        };

        foreach (var (name, url) in services)
        {
            _log.Wait(name);
            if (!await WaitForService(url, ct))
            {
                _log.CheckFail(name);
                return false;
            }
            _log.CheckOk(name);
        }

        return true;
    }

    private async Task<bool> WaitForService(string url, CancellationToken ct, int maxRetries = 30, int delayMs = 2000)
    {
        for (int i = 0; i < maxRetries; i++)
        {
            if (ct.IsCancellationRequested)
                return false;

            try
            {
                var ok = await _healthCheck.CheckHttpAsync(url, 5000);
                if (ok) return true;
            }
            catch
            {
            }

            await Task.Delay(delayMs, ct);
        }

        return false;
    }
}
