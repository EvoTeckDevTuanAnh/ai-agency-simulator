using Xunit;

namespace AiAgencyLauncher.Tests;

public class ExitCodeTests
{
    [Fact]
    public void Success_IsZero()
    {
        Assert.Equal(0, (int)LauncherExitCode.Success);
    }

    [Fact]
    public void ComposeFileNotFound_HasCorrectCode()
    {
        Assert.Equal(2, (int)LauncherExitCode.ComposeFileNotFound);
    }

    [Fact]
    public void EnvFileNotFound_HasCorrectCode()
    {
        Assert.Equal(3, (int)LauncherExitCode.EnvFileNotFound);
    }

    [Fact]
    public void DockerNotInstalled_HasCorrectCode()
    {
        Assert.Equal(4, (int)LauncherExitCode.DockerNotInstalled);
    }

    [Fact]
    public void DockerEngineNotRunning_HasCorrectCode()
    {
        Assert.Equal(5, (int)LauncherExitCode.DockerEngineNotRunning);
    }

    [Fact]
    public void HealthCheckTimeout_HasCorrectCode()
    {
        Assert.Equal(8, (int)LauncherExitCode.HealthCheckTimeout);
    }

    [Fact]
    public void InvalidArgument_HasCorrectCode()
    {
        Assert.Equal(10, (int)LauncherExitCode.InvalidArgument);
    }
}
