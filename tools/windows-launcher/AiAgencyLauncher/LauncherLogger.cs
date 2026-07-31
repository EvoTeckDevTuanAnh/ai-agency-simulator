namespace AiAgencyLauncher;

public class LauncherLogger
{
    public void Info(string message)
    {
        Console.WriteLine(message);
    }

    public void Success(string message)
    {
        var color = Console.ForegroundColor;
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"[SUCCESS] {message}");
        Console.ForegroundColor = color;
    }

    public void Error(string message)
    {
        var color = Console.ForegroundColor;
        Console.ForegroundColor = ConsoleColor.Red;
        Console.Error.WriteLine($"[ERROR] {message}");
        Console.ForegroundColor = color;
    }

    public void Step(string label, string message)
    {
        var color = Console.ForegroundColor;
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.Write($"[{label}] ");
        Console.ForegroundColor = color;
        Console.WriteLine(message);
    }

    public void CheckOk(string label)
    {
        var color = Console.ForegroundColor;
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"[OK] {label}");
        Console.ForegroundColor = color;
    }

    public void CheckFail(string label)
    {
        var color = Console.ForegroundColor;
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"[FAIL] {label}");
        Console.ForegroundColor = color;
    }

    public void Wait(string label)
    {
        var color = Console.ForegroundColor;
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine($"[WAIT] {label}");
        Console.ForegroundColor = color;
    }

    public void Hint(string message)
    {
        var color = Console.ForegroundColor;
        Console.ForegroundColor = ConsoleColor.DarkGray;
        Console.WriteLine(message);
        Console.ForegroundColor = color;
    }
}
