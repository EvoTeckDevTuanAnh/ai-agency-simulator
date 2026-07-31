using Xunit;

namespace AiAgencyLauncher.Tests;

public class LauncherApplicationTests
{
    private readonly string _testRoot;

    public LauncherApplicationTests()
    {
        _testRoot = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(_testRoot);
        File.WriteAllText(Path.Combine(_testRoot, "docker-compose.yml"), "services:");
        File.WriteAllText(Path.Combine(_testRoot, ".env"), "AUTH_ADMIN_PASSWORD=test");
    }

    private LauncherApplication CreateApp(LauncherMode mode, bool openBrowser,
        MockDockerCommandService? dockerCmd = null,
        MockHealthCheckService? health = null,
        MockBrowserLauncher? browser = null)
    {
        var options = new LauncherModeAndBrowser(mode, openBrowser);
        var opts = mode switch
        {
            LauncherMode.Start => openBrowser ? LauncherOptions.Parse([]) : LauncherOptions.Parse(["--start"]),
            LauncherMode.Stop => LauncherOptions.Parse(["--stop"]),
            LauncherMode.Restart => LauncherOptions.Parse(["--restart"]),
            LauncherMode.Status => LauncherOptions.Parse(["--status"]),
            LauncherMode.Logs => LauncherOptions.Parse(["--logs"]),
            _ => LauncherOptions.Parse([]),
        };

        var log = new LauncherLogger();
        var resolver = new ProjectPathResolver(_testRoot);
        var cmd = dockerCmd ?? new MockDockerCommandService();
        var dockerHealth = new DockerHealthService(cmd);
        var hc = health ?? new MockHealthCheckService();
        var br = browser ?? new MockBrowserLauncher();

        return new LauncherApplication(opts, log, resolver, cmd, dockerHealth, hc, br);
    }

    private record LauncherModeAndBrowser(LauncherMode Mode, bool OpenBrowser);

    [Fact]
    public async Task DockerNotInstalled_ReturnsError()
    {
        var cmd = new MockDockerCommandService { Installed = false };
        var app = CreateApp(LauncherMode.Start, false, dockerCmd: cmd);
        var exitCode = await app.RunAsync(CancellationToken.None);
        Assert.Equal(LauncherExitCode.DockerNotInstalled, exitCode);
    }

    [Fact]
    public async Task DockerEngineNotRunning_ReturnsError()
    {
        var cmd = new MockDockerCommandService { EngineRunning = false };
        var app = CreateApp(LauncherMode.Start, false, dockerCmd: cmd);
        var exitCode = await app.RunAsync(CancellationToken.None);
        Assert.Equal(LauncherExitCode.DockerEngineNotRunning, exitCode);
    }

    [Fact]
    public async Task ComposeNotAvailable_ReturnsError()
    {
        var cmd = new MockDockerCommandService { ComposeAvailable = false };
        var app = CreateApp(LauncherMode.Start, false, dockerCmd: cmd);
        var exitCode = await app.RunAsync(CancellationToken.None);
        Assert.Equal(LauncherExitCode.DockerComposeNotAvailable, exitCode);
    }

    [Fact]
    public async Task ComposeUpFails_ReturnsError()
    {
        var cmd = new MockDockerCommandService { ComposeUpResult = false };
        var app = CreateApp(LauncherMode.Start, false, dockerCmd: cmd);
        var exitCode = await app.RunAsync(CancellationToken.None);
        Assert.Equal(LauncherExitCode.ComposeUpFailed, exitCode);
    }

    [Fact]
    public async Task HealthCheckTimeout_ReturnsError()
    {
        var health = new MockHealthCheckService { Healthy = false };
        var app = CreateApp(LauncherMode.Start, false, health: health);
        var exitCode = await app.RunAsync(CancellationToken.None);
        Assert.Equal(LauncherExitCode.HealthCheckTimeout, exitCode);
    }

    [Fact]
    public async Task StartSuccess_ReturnsSuccess()
    {
        var browser = new MockBrowserLauncher();
        var app = CreateApp(LauncherMode.Start, false, browser: browser);
        var exitCode = await app.RunAsync(CancellationToken.None);
        Assert.Equal(LauncherExitCode.Success, exitCode);
    }

    [Fact]
    public async Task StartNoArgs_OpensBrowserOnce()
    {
        var browser = new MockBrowserLauncher();
        var opts = LauncherOptions.Parse([]); // no args = start + open browser
        var log = new LauncherLogger();
        var resolver = new ProjectPathResolver(_testRoot);
        var cmd = new MockDockerCommandService();
        var dockerHealth = new DockerHealthService(cmd);
        var health = new MockHealthCheckService();
        var app = new LauncherApplication(opts, log, resolver, cmd, dockerHealth, health, browser);

        var exitCode = await app.RunAsync(CancellationToken.None);
        Assert.Equal(LauncherExitCode.Success, exitCode);
        Assert.Equal(1, browser.OpenCount);
        Assert.Equal("http://localhost", browser.LastUrl);
    }

    [Fact]
    public async Task Stop_ReturnsSuccess()
    {
        var app = CreateApp(LauncherMode.Stop, false);
        var exitCode = await app.RunAsync(CancellationToken.None);
        Assert.Equal(LauncherExitCode.Success, exitCode);
    }

    [Fact]
    public async Task StopFails_ReturnsError()
    {
        var cmd = new MockDockerCommandService { ComposeDownResult = false };
        var app = CreateApp(LauncherMode.Stop, false, dockerCmd: cmd);
        var exitCode = await app.RunAsync(CancellationToken.None);
        Assert.Equal(LauncherExitCode.UnknownError, exitCode);
    }

    [Fact]
    public async Task Restart_StopsThenStarts()
    {
        var browser = new MockBrowserLauncher();
        var app = CreateApp(LauncherMode.Restart, false, browser: browser);
        var exitCode = await app.RunAsync(CancellationToken.None);
        Assert.Equal(LauncherExitCode.Success, exitCode);
    }

    [Fact]
    public async Task StatusHealthy_ReturnsSuccess()
    {
        var app = CreateApp(LauncherMode.Status, false);
        var exitCode = await app.RunAsync(CancellationToken.None);
        Assert.Equal(LauncherExitCode.Success, exitCode);
    }

    [Fact]
    public async Task StatusUnhealthy_ReturnsError()
    {
        var cmd = new MockDockerCommandService { ComposePsOutput = "exited" };
        var app = CreateApp(LauncherMode.Status, false, dockerCmd: cmd);
        var exitCode = await app.RunAsync(CancellationToken.None);
        Assert.Equal(LauncherExitCode.UnknownError, exitCode);
    }

    [Fact]
    public async Task Logs_ReturnsSuccess()
    {
        var app = CreateApp(LauncherMode.Logs, false);
        var exitCode = await app.RunAsync(CancellationToken.None);
        Assert.Equal(LauncherExitCode.Success, exitCode);
    }

    [Fact]
    public void ComposeFileMissing_ReturnsError()
    {
        var emptyDir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(emptyDir);
        try
        {
            var opts = LauncherOptions.Parse(["--start"]);
            var log = new LauncherLogger();
            var resolver = new ProjectPathResolver(emptyDir);
            var cmd = new MockDockerCommandService();
            var dockerHealth = new DockerHealthService(cmd);
            var health = new MockHealthCheckService();
            var browser = new MockBrowserLauncher();
            var app = new LauncherApplication(opts, log, resolver, cmd, dockerHealth, health, browser);

            var exitCode = app.RunAsync(CancellationToken.None).Result;
            Assert.Equal(LauncherExitCode.ComposeFileNotFound, exitCode);
        }
        finally
        {
            Directory.Delete(emptyDir, true);
        }
    }

    [Fact]
    public void EnvFileMissing_ReturnsError()
    {
        var dir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(dir);
        File.WriteAllText(Path.Combine(dir, "docker-compose.yml"), "services:");
        try
        {
            var opts = LauncherOptions.Parse(["--start"]);
            var log = new LauncherLogger();
            var resolver = new ProjectPathResolver(dir);
            var cmd = new MockDockerCommandService();
            var dockerHealth = new DockerHealthService(cmd);
            var health = new MockHealthCheckService();
            var browser = new MockBrowserLauncher();
            var app = new LauncherApplication(opts, log, resolver, cmd, dockerHealth, health, browser);

            var exitCode = app.RunAsync(CancellationToken.None).Result;
            Assert.Equal(LauncherExitCode.EnvFileNotFound, exitCode);
        }
        finally
        {
            Directory.Delete(dir, true);
        }
    }

    [Fact]
    public void TwoStarts_SecondReturnsError()
    {
        var browser = new MockBrowserLauncher();
        var app1 = CreateApp(LauncherMode.Start, false, browser: browser);
        var app2 = CreateApp(LauncherMode.Start, false, browser: browser);

        var task1 = app1.RunAsync(CancellationToken.None);
        var task2 = app2.RunAsync(CancellationToken.None);

        Task.WaitAll(task1, task2);
        Assert.Equal(LauncherExitCode.Success, task1.Result);
        Assert.Equal(LauncherExitCode.UnknownError, task2.Result);
    }
}
