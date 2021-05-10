package org.fulib.webapp.projects;

import org.fulib.webapp.projects.zip.ProjectZip;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class MainTest
{
	private static final ProjectZip projectZip = mock(ProjectZip.class);
	private static final Projects projects = mock(Projects.class);
	private static final Main main = new Main(projectZip, projects);

	@BeforeClass
	public static void setup()
	{
		main.start();
		main.awaitStart();
	}

	@AfterClass
	public static void teardown()
	{
		main.awaitStop();
	}

	@Test
	public void projectZip() throws IOException
	{
		when(projectZip.handle(any(), any())).thenReturn("");

		checkRoute("POST", "/api/projectzip");

		verify(projectZip).handle(any(), any());
	}

	@Test
	public void projects() throws Exception
	{
		when(projects.get(any(), any())).thenReturn("");
		when(projects.getAll(any(), any())).thenReturn("");
		when(projects.create(any(), any())).thenReturn("");
		when(projects.update(any(), any())).thenReturn("");
		when(projects.delete(any(), any())).thenReturn("");

		checkRoute("POST", "/api/projects");
		checkRoute("GET", "/api/projects");
		checkRoute("GET", "/api/projects/1");
		checkRoute("PUT", "/api/projects/1");
		checkRoute("DELETE", "/api/projects/1");

		verify(projects).get(any(), any());
		verify(projects).getAll(any(), any());
		verify(projects).create(any(), any());
		verify(projects).update(any(), any());
		verify(projects).delete(any(), any());
	}

	private void checkRoute(String method, String path) throws IOException
	{
		this.checkRoute(method, path, 200);
	}

	private void checkRoute(String method, String path, int status) throws IOException
	{
		final URL url = new URL("http", "localhost", Main.PORT, path);

		final HttpURLConnection conn = (HttpURLConnection) url.openConnection();
		conn.setRequestMethod(method);
		try
		{
			assertThat(conn.getResponseCode(), equalTo(status));
		}
		finally
		{
			conn.disconnect();
		}
	}
}
