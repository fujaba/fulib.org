package org.fulib.webapp.projects.zip;

import org.fulib.webapp.projects.mongo.Mongo;
import org.fulib.webapp.projects.util.DelegatingServletOutputStream;
import org.junit.Test;
import spark.Request;
import spark.Response;

import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static org.hamcrest.CoreMatchers.hasItems;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Mockito.*;

public class ProjectZipTest
{
	@Test
	public void handle() throws IOException
	{
		final ProjectZip projectZip = new ProjectZip();

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

		projectZip.handle(request, response);

		verify(response).type("application/zip");

		final Set<String> files = new HashSet<>();

		final byte[] responseBytes = outputStream.toByteArray();
		try (final ZipInputStream zipInputStream = new ZipInputStream(new ByteArrayInputStream(responseBytes)))
		{
			ZipEntry entry;
			while ((entry = zipInputStream.getNextEntry()) != null)
			{
				files.add(entry.getName());
			}
		}

		assertThat(files, hasItems("src/main/scenarios/org/example/Scenario.md", ".gitignore", "gradlew", "gradlew.bat",
		                           "gradle/wrapper/gradle-wrapper.jar", "gradle/wrapper/gradle-wrapper.properties",
		                           "settings.gradle", "build.gradle", "src/gen/java/org/example/MyDecorator.java"));
		// TODO check contents of Scenario.md (scenarioText), settings.gradle (projectName), build.gradle (packageName,
		//  projectVersion), and MyDecorator.java (decoratorClassName, packageName)
	}
}
