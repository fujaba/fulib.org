package org.fulib.webapp.projects.projects;

import org.apache.commons.io.IOUtils;
import org.fulib.webapp.projects.Main;

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

		generator.generate("settings.gradle",
		                   output -> output.write(getSettingsGradle(data).getBytes(StandardCharsets.UTF_8)));
		generator.generate("build.gradle",
		                   output -> output.write(getBuildGradle(data).getBytes(StandardCharsets.UTF_8)));

		final String decorator = data.getDecoratorClassName();
		if (decorator != null)
		{
			generator.generate("src/gen/java/" + packageDir + "/" + decorator + ".java",
			                   output -> output.write(getDecoratorJava(data).getBytes(StandardCharsets.UTF_8)));
		}
	}

	private String getSettingsGradle(ProjectData data) throws IOException
	{
		try (final InputStream input = Main.class.getResourceAsStream("zip/settings.gradle"))
		{
			final String content = IOUtils.toString(input, StandardCharsets.UTF_8);
			return content.replace("$$projectName$$", data.getProjectName());
		}
	}

	private String getBuildGradle(ProjectData data) throws IOException
	{
		try (final InputStream input = Main.class.getResourceAsStream("zip/build.gradle"))
		{
			final String content = IOUtils.toString(input, StandardCharsets.UTF_8);
			return content
				.replace("$$packageName$$", data.getPackageName())
				.replace("$$projectVersion$$", data.getProjectVersion());
		}
	}

	private String getDecoratorJava(ProjectData data) throws IOException
	{
		try (final InputStream input = Main.class.getResourceAsStream("zip/Decorator.java.txt"))
		{
			final String content = IOUtils.toString(input, StandardCharsets.UTF_8);
			return content
				.replace("$$packageName$$", data.getPackageName())
				.replace("$$decoratorClassName$$", data.getDecoratorClassName());
		}
	}

	private void copy(FileGenerator generator, String file) throws IOException
	{
		copy(generator, file, file);
	}

	private void copy(FileGenerator generator, String resourceName, String file) throws IOException
	{
		generator.generate(file, output -> {
			try (final InputStream fileInput = Main.class.getResourceAsStream("zip/" + resourceName))
			{
				IOUtils.copyLarge(fileInput, output, buffer);
			}
		});
	}
}
