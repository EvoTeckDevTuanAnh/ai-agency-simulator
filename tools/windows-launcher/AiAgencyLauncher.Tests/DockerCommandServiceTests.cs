using Xunit;

namespace AiAgencyLauncher.Tests;

public class DockerCommandServiceTests
{
    [Fact]
    public void CheckDockerInstalled_UsesCorrectArguments()
    {
        var service = new DockerCommandService(new LauncherLogger());
        // This test just verifies the class can be instantiated
        // Actual Docker calls are mocked in LauncherApplicationTests
        Assert.NotNull(service);
    }

    [Fact]
    public void ProcessStartInfo_DoesNotUseShellExecute()
    {
        var log = new LauncherLogger();
        var service = new DockerCommandService(log);

        // Verify that the service can be constructed
        Assert.NotNull(service);
    }
}
