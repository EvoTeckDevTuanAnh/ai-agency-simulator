namespace AiAgencyLauncher;

public class ProjectPathResolver
{
    private readonly string _exeDir;

    public ProjectPathResolver(string exeDir)
    {
        _exeDir = exeDir;
    }

    public string FindProjectRoot()
    {
        var dir = _exeDir;

        for (int i = 0; i < 10; i++)
        {
            if (HasComposeFile(dir))
                return dir;

            var parent = Directory.GetParent(dir);
            if (parent == null)
                break;
            dir = parent.FullName;
        }

        throw new FileNotFoundException(
            "Cannot find docker-compose.yml or compose.yml in any parent directory of the executable.");
    }

    public static string FindComposeFile(string projectRoot)
    {
        var yml = Path.Combine(projectRoot, "docker-compose.yml");
        if (File.Exists(yml))
            return yml;

        var yaml = Path.Combine(projectRoot, "docker-compose.yaml");
        if (File.Exists(yaml))
            return yaml;

        var simpleYml = Path.Combine(projectRoot, "compose.yml");
        if (File.Exists(simpleYml))
            return simpleYml;

        var simpleYaml = Path.Combine(projectRoot, "compose.yaml");
        if (File.Exists(simpleYaml))
            return simpleYaml;

        throw new FileNotFoundException(
            $"docker-compose.yml not found in {projectRoot}. Ensure the launcher is in the project directory or a subdirectory.");
    }

    public static string FindEnvFile(string projectRoot)
    {
        var env = Path.Combine(projectRoot, ".env");
        if (File.Exists(env))
            return env;

        throw new FileNotFoundException(
            $".env file not found in {projectRoot}. Copy .env.example to .env and configure it.");
    }

    private static bool HasComposeFile(string dir)
    {
        return File.Exists(Path.Combine(dir, "docker-compose.yml"))
            || File.Exists(Path.Combine(dir, "docker-compose.yaml"))
            || File.Exists(Path.Combine(dir, "compose.yml"))
            || File.Exists(Path.Combine(dir, "compose.yaml"));
    }
}
