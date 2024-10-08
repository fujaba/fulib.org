package org.fulib.webapp.projectzip;

import org.fulib.webapp.util.DelegatingServletOutputStream;
import org.junit.Test;
import spark.Request;
import spark.Response;

import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static org.hamcrest.CoreMatchers.hasItems;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.*;

public class ProjectZipControllerTest
{
	private static final String[] EXPECTED_FILES = {
		".gitignore",
		"settings.gradle",
		"build.gradle",
		"gradlew",
		"gradlew.bat",
		"gradle/wrapper/gradle-wrapper.jar",
		"gradle/wrapper/gradle-wrapper.properties",
		"src/gen/java/org/example/MyDecorator.java",
		"src/main/scenarios/org/example/Scenario.md",
	};
	private static final Map<String, String> EXPECTED_CONTENT = Map.of(
		"settings.gradle", "rootProject.name = 'myProject'\n",
		"build.gradle", """
			plugins {
			\tid 'java'
			\t// https://plugins.gradle.org/plugin/org.fulib.fulibGradle
			\tid 'org.fulib.fulibGradle' version '0.5.0'
			}

			group = 'org.example'
			version = '1.2.3'

			repositories {
			\tmavenLocal()
			\tmavenCentral()
			}

			dependencies {
			\t// https://mvnrepository.com/artifact/org.fulib/fulibScenarios
			\tfulibScenarios group: 'org.fulib', name: 'fulibScenarios', version: '1.7.1'

			\t// https://mvnrepository.com/artifact/org.slf4j/slf4j-simple
			\tfulibScenarios group: 'org.slf4j', name: 'slf4j-simple', version: '2.0.13'

			\t// https://mvnrepository.com/artifact/org.fulib/fulibTools
			\ttestImplementation group: 'org.fulib', name: 'fulibTools', version: '1.6.0'

			\t// https://mvnrepository.com/artifact/org.fulib/fulibTables
			\ttestImplementation group: 'org.fulib', name: 'fulibTables', version: '1.4.0'

			\t// https://mvnrepository.com/artifact/junit/junit
			\ttestImplementation group: 'junit', name: 'junit', version: '4.13.2'

			\t// https://mvnrepository.com/artifact/org.slf4j/slf4j-simple
			\ttestImplementation group: 'org.slf4j', name: 'slf4j-simple', version: '2.0.13'
			}

			generateScenarioSource {
			\tclassDiagramSVG = true
			}
			""",
		"src/gen/java/org/example/MyDecorator.java", """
			package org.example;

			import org.fulib.builder.ClassModelDecorator;
			import org.fulib.builder.ClassModelManager;

			public class MyDecorator implements ClassModelDecorator
			{
			\t@Override
			\tpublic void decorate(ClassModelManager mm)
			\t{
			\t}
			}
			""",
		"src/main/scenarios/org/example/Scenario.md", """
			# Test

			There is a Student with name Alice."""
	);

	@Test
	public void handle() throws IOException
	{
		final ProjectGenerator projectGenerator = new ProjectGenerator();
		final ProjectZipController projectZipController = new ProjectZipController(projectGenerator);

		final Request request = mock(Request.class);
		final String ip = "0.0.0.0";
		final String userAgent = "test/1.0";
		// language=JSON
		final String requestBody =
			"{\n" + "  \"packageName\": \"org.example\",\n" + "  \"scenarioFileName\": \"Scenario.md\",\n"
			+ "  \"projectName\": \"myProject\",\n" + "  \"projectVersion\": \"1.2.3\",\n"
			+ "  \"scenarioText\": \"# Test\\n\\nThere is a Student with name Alice.\",\n"
			+ "  \"decoratorClassName\": \"MyDecorator\",\n" + "  \"privacy\": \"all\"\n" + "}";
		when(request.ip()).thenReturn(ip);
		when(request.userAgent()).thenReturn(userAgent);
		when(request.body()).thenReturn(requestBody);

		final Response response = mock(Response.class);
		final HttpServletResponse servletResponse = mock(HttpServletResponse.class);
		final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

		when(response.raw()).thenReturn(servletResponse);
		when(servletResponse.getOutputStream()).thenReturn(new DelegatingServletOutputStream(outputStream));

		projectZipController.handle(request, response);

		verify(response).type("application/zip");

		final Set<String> files = new HashSet<>();
		final Map<String, String> contents = new HashMap<>();

		final byte[] responseBytes = outputStream.toByteArray();
		try (final ZipInputStream zipInputStream = new ZipInputStream(new ByteArrayInputStream(responseBytes)))
		{
			ZipEntry entry;
			while ((entry = zipInputStream.getNextEntry()) != null)
			{
				files.add(entry.getName());
				if (EXPECTED_CONTENT.containsKey(entry.getName()))
				{
					final String content = new String(zipInputStream.readAllBytes(), StandardCharsets.UTF_8);
					contents.put(entry.getName(), content);
				}
			}
		}

		assertThat(files, hasItems(EXPECTED_FILES));
		for (final Map.Entry<String, String> entry : EXPECTED_CONTENT.entrySet())
		{
			assertEquals(entry.getKey(), entry.getValue(), contents.get(entry.getKey()));
		}
	}
}
