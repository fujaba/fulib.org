package org.fulib.webapp.projects;

import org.fulib.webapp.projects.controller.ContainerController;
import org.fulib.webapp.projects.controller.ProjectController;
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
	private static final ProjectController projectController = mock(ProjectController.class);
	private static final ContainerController containerController = mock(ContainerController.class);
	private static final Main main = new Main(projectZip, projectController, containerController);

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
		when(projectController.get(any(), any())).thenReturn("");
		when(projectController.getAll(any(), any())).thenReturn("");
		when(projectController.create(any(), any())).thenReturn("");
		when(projectController.update(any(), any())).thenReturn("");
		when(projectController.delete(any(), any())).thenReturn("");

		checkRoute("POST", "/api/projects");
		checkRoute("GET", "/api/projects");
		checkRoute("GET", "/api/projects/1");
		checkRoute("PUT", "/api/projects/1");
		checkRoute("DELETE", "/api/projects/1");

		verify(projectController).get(any(), any());
		verify(projectController).getAll(any(), any());
		verify(projectController).create(any(), any());
		verify(projectController).update(any(), any());
		verify(projectController).delete(any(), any());
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
