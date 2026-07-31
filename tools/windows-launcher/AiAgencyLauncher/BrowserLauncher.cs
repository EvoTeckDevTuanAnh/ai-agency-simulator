using System.Diagnostics;

namespace AiAgencyLauncher;

public interface IBrowserLauncher
{
    void OpenUrl(string url);
}

public class BrowserLauncher : IBrowserLauncher
{
    public void OpenUrl(string url)
    {
        try
        {
            var psi = new ProcessStartInfo
            {
                FileName = url,
                UseShellExecute = true,
            };
            Process.Start(psi);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[ERROR] Failed to open browser: {ex.Message}");
        }
    }
}
