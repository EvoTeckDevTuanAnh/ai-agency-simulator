namespace AiAgencyLauncher;

public enum LauncherExitCode
{
    Success = 0,
    UnknownError = 1,
    ComposeFileNotFound = 2,
    EnvFileNotFound = 3,
    DockerNotInstalled = 4,
    DockerEngineNotRunning = 5,
    DockerComposeNotAvailable = 6,
    ComposeUpFailed = 7,
    HealthCheckTimeout = 8,
    Cancelled = 9,
    InvalidArgument = 10,
}
