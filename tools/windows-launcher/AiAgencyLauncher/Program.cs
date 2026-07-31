using AiAgencyLauncher;

var log = new LauncherLogger();
LauncherOptions options;

try
{
    options = LauncherOptions.Parse(args);
}
catch (ArgumentException ex)
{
    log.Error(ex.Message);
    log.Hint("Usage: AiAgencySimulator.exe [--start | --stop | --restart | --status | --logs]");
    return (int)LauncherExitCode.InvalidArgument;
}

var exeDir = AppContext.BaseDirectory;
var pathResolver = new ProjectPathResolver(exeDir);
var dockerCommand = new DockerCommandService(log);
var dockerHealth = new DockerHealthService(dockerCommand);
var healthCheck = new HealthCheckService();
var browser = new BrowserLauncher();

var app = new LauncherApplication(
    options, log, pathResolver,
    dockerCommand, dockerHealth,
    healthCheck, browser);

using var cts = new CancellationTokenSource();
Console.CancelKeyPress += (sender, e) =>
{
    e.Cancel = true;
    log.Info(string.Empty);
    log.Info("Shutdown requested. Containers continue running. Use --stop to shut down.");
    cts.Cancel();
};

var exitCode = await app.RunAsync(cts.Token);
return (int)exitCode;
