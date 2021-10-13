package org.fulib.webapp.projectzip;

import org.apache.commons.io.IOUtils;
import org.fulib.webapp.Main;

import javax.inject.Inject;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

public class ProjectGenerator
{
	public interface FileGenerator
	{
		void generate(String name, OutputStreamConsumer output) throws IOException;
	}

	public interface OutputStreamConsumer
	{
		void accept(OutputStream output) throws IOException;
	}

	private final byte[] buffer = new byte[8192];

	@Inject
	public ProjectGenerator()
	{
	}

	public void generate(ProjectData data, FileGenerator generator) throws IOException
	{
		final String packageDir = data.getPackageName().replace('.', '/');
		final String fileName = data.getScenarioFileName();

		generator.generate("src/main/scenarios/" + packageDir + "/" + fileName, output -> {
			final String scenarioText = data.getScenarioText();
			if (scenarioText != null)
			{
				output.write(scenarioText.getBytes(StandardCharsets.UTF_8));
			}
		});

		copy(generator, "default.gitignore", ".gitignore");
		copy(generator, "gradlew");
		copy(generator, "gradlew.bat");
		copy(generator, "gradle/wrapper/gradle-wrapper.jar.zip", "gradle/wrapper/gradle-wrapper.jar");
		copy(generator, "gradle/wrapper/gradle-wrapper.properties");
		copy(generator, ".fulib/launch/shell.json");
		copy(generator, ".fulib/launch/gradle-build.json");
		copy(generator, ".fulib/launch/continuous-test.json");
		copy(generator, ".fulib/launch/continuous-compile.json");

		copy(generator, "settings.gradle", "settings.gradle", //
		     "$$projectName$$", data.getProjectName());
		copy(generator, "build.gradle", "build.gradle", //
		     "$$packageName$$", data.getPackageName(), "$$projectVersion$$", data.getProjectVersion());

		final String decorator = data.getDecoratorClassName();
		if (decorator != null)
		{
			copy(generator, "Decorator.java.txt", "src/gen/java/" + packageDir + "/" + decorator + ".java", //
			     "$$packageName$$", data.getPackageName(), "$$decoratorClassName$$", data.getDecoratorClassName());
		}
	}

	private void copy(FileGenerator generator, String file) throws IOException
	{
		copy(generator, file, file);
	}

	private void copy(FileGenerator generator, String resourceName, String file) throws IOException
	{
		generator.generate(file, output -> {
			try (final InputStream fileInput = ProjectGenerator.class.getResourceAsStream(resourceName))
			{
				IOUtils.copyLarge(fileInput, output, buffer);
			}
		});
	}

	private void copy(FileGenerator generator, String resourceName, String file, String... replacements)
		throws IOException
	{
		generator.generate(file, output -> {
			try (final InputStream input = ProjectGenerator.class.getResourceAsStream(resourceName))
			{
				String content = IOUtils.toString(input, StandardCharsets.UTF_8);
				for (int i = 0; i < replacements.length; i += 2)
				{
					content = content.replace(replacements[i], replacements[i + 1]);
				}
				output.write(content.getBytes(StandardCharsets.UTF_8));
			}
		});
	}
}
