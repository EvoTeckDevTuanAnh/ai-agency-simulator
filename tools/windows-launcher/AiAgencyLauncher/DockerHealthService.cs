namespace AiAgencyLauncher;

public interface IDockerHealthService
{
    Task<bool> IsDockerInstalled();
    Task<bool> IsEngineRunning();
    Task<bool> IsComposeAvailable();
}

public class DockerHealthService : IDockerHealthService
{
    private readonly IDockerCommandService _command;

    public DockerHealthService(IDockerCommandService command)
    {
        _command = command;
    }

    public async Task<bool> IsDockerInstalled()
    {
        return await _command.CheckDockerInstalled();
    }

    public async Task<bool> IsEngineRunning()
    {
        return await _command.CheckDockerEngineRunning();
    }

    public async Task<bool> IsComposeAvailable()
    {
        return await _command.CheckDockerComposeAvailable();
    }
}
