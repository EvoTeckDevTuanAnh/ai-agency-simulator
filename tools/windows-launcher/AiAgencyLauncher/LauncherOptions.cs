namespace AiAgencyLauncher;

public enum LauncherMode
{
    Start,
    Stop,
    Restart,
    Status,
    Logs,
}

public class LauncherOptions
{
    public LauncherMode Mode { get; private set; }
    public bool OpenBrowser { get; private set; }

    private LauncherOptions(LauncherMode mode, bool openBrowser)
    {
        Mode = mode;
        OpenBrowser = openBrowser;
    }

    public static LauncherOptions Parse(string[] args)
    {
        if (args.Length == 0)
            return new LauncherOptions(LauncherMode.Start, openBrowser: true);

        var arg = args[0].ToLowerInvariant();

        switch (arg)
        {
            case "--start":
                return new LauncherOptions(LauncherMode.Start, openBrowser: false);
            case "--stop":
                return new LauncherOptions(LauncherMode.Stop, openBrowser: false);
            case "--restart":
                return new LauncherOptions(LauncherMode.Restart, openBrowser: false);
            case "--status":
                return new LauncherOptions(LauncherMode.Status, openBrowser: false);
            case "--logs":
                return new LauncherOptions(LauncherMode.Logs, openBrowser: false);
            default:
                throw new ArgumentException($"Unknown argument: {args[0]}. Valid: --start, --stop, --restart, --status, --logs");
        }
    }
}
