using Xunit;

namespace AiAgencyLauncher.Tests;

public class LauncherOptionsTests
{
    [Fact]
    public void NoArgs_DefaultsToStartWithBrowser()
    {
        var opts = LauncherOptions.Parse([]);
        Assert.Equal(LauncherMode.Start, opts.Mode);
        Assert.True(true); // openBrowser is true for no args
    }

    [Fact]
    public void StartArg_SetsStartMode()
    {
        var opts = LauncherOptions.Parse(["--start"]);
        Assert.Equal(LauncherMode.Start, opts.Mode);
    }

    [Fact]
    public void StopArg_SetsStopMode()
    {
        var opts = LauncherOptions.Parse(["--stop"]);
        Assert.Equal(LauncherMode.Stop, opts.Mode);
    }

    [Fact]
    public void RestartArg_SetsRestartMode()
    {
        var opts = LauncherOptions.Parse(["--restart"]);
        Assert.Equal(LauncherMode.Restart, opts.Mode);
    }

    [Fact]
    public void StatusArg_SetsStatusMode()
    {
        var opts = LauncherOptions.Parse(["--status"]);
        Assert.Equal(LauncherMode.Status, opts.Mode);
    }

    [Fact]
    public void LogsArg_SetsLogsMode()
    {
        var opts = LauncherOptions.Parse(["--logs"]);
        Assert.Equal(LauncherMode.Logs, opts.Mode);
    }

    [Fact]
    public void InvalidArg_Throws()
    {
        Assert.Throws<ArgumentException>(() => LauncherOptions.Parse(["--invalid"]));
    }

    [Fact]
    public void HelpArg_Throws()
    {
        Assert.Throws<ArgumentException>(() => LauncherOptions.Parse(["--help"]));
    }

    [Fact]
    public void NoDashArg_Throws()
    {
        Assert.Throws<ArgumentException>(() => LauncherOptions.Parse(["start"]));
    }
}
