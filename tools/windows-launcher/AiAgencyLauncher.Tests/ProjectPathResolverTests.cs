using Xunit;

namespace AiAgencyLauncher.Tests;

public class ProjectPathResolverTests
{
    [Fact]
    public void FindComposeFile_WithDockerComposeYml_ReturnsPath()
    {
        var dir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(dir);
        try
        {
            var file = Path.Combine(dir, "docker-compose.yml");
            File.WriteAllText(file, "services:");

            var found = ProjectPathResolver.FindComposeFile(dir);
            Assert.Equal(file, found);
        }
        finally
        {
            Directory.Delete(dir, true);
        }
    }

    [Fact]
    public void FindComposeFile_WithComposeYml_ReturnsPath()
    {
        var dir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(dir);
        try
        {
            var file = Path.Combine(dir, "compose.yml");
            File.WriteAllText(file, "services:");

            var found = ProjectPathResolver.FindComposeFile(dir);
            Assert.Equal(file, found);
        }
        finally
        {
            Directory.Delete(dir, true);
        }
    }

    [Fact]
    public void FindComposeFile_Missing_Throws()
    {
        var dir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(dir);
        try
        {
            Assert.Throws<FileNotFoundException>(() => ProjectPathResolver.FindComposeFile(dir));
        }
        finally
        {
            Directory.Delete(dir, true);
        }
    }

    [Fact]
    public void FindEnvFile_WhenExists_ReturnsPath()
    {
        var dir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(dir);
        try
        {
            File.WriteAllText(Path.Combine(dir, ".env"), "AUTH_ADMIN_PASSWORD=test");
            var found = ProjectPathResolver.FindEnvFile(dir);
            Assert.NotNull(found);
            Assert.EndsWith(".env", found);
        }
        finally
        {
            Directory.Delete(dir, true);
        }
    }

    [Fact]
    public void FindEnvFile_Missing_Throws()
    {
        var dir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(dir);
        try
        {
            Assert.Throws<FileNotFoundException>(() => ProjectPathResolver.FindEnvFile(dir));
        }
        finally
        {
            Directory.Delete(dir, true);
        }
    }

    [Fact]
    public void FindProjectRoot_WithComposeFileInParent_FindsRoot()
    {
        var root = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        var subdir = Path.Combine(root, "sub", "deep");
        Directory.CreateDirectory(subdir);
        try
        {
            File.WriteAllText(Path.Combine(root, "docker-compose.yml"), "services:");
            var resolver = new ProjectPathResolver(subdir);
            var found = resolver.FindProjectRoot();
            Assert.Equal(root, found);
        }
        finally
        {
            Directory.Delete(root, true);
        }
    }

    [Fact]
    public void FindProjectRoot_NoComposeFile_Throws()
    {
        var dir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
        Directory.CreateDirectory(dir);
        try
        {
            var resolver = new ProjectPathResolver(dir);
            Assert.Throws<FileNotFoundException>(() => resolver.FindProjectRoot());
        }
        finally
        {
            Directory.Delete(dir, true);
        }
    }
}
