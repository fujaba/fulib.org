package org.fulib.webapp;

import org.fulib.webapp.projectzip.ProjectZipController;
import org.fulib.webapp.tool.RunCodeGen;
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
	private static final RunCodeGen runCodeGen = mock(RunCodeGen.class);
	private static final ProjectZipController projectZipController = mock(ProjectZipController.class);
	private static final Main service = new Main(runCodeGen, projectZipController);

	@BeforeClass
	public static void setup()
	{
		when(runCodeGen.getTempDir()).thenReturn(System.getProperty("java.io.tmpdir"));

		service.start();
		service.awaitStart();
	}

	@AfterClass
	public static void teardown()
	{
		service.awaitStop();
	}

	@Test
	public void runCodeGen() throws Exception
	{
		when(runCodeGen.handle(any(), any())).thenReturn("");

		checkRoute("POST", "/runcodegen");

		verify(runCodeGen).handle(any(), any());
	}

	@Test
	public void projectZip() throws IOException
	{
		when(projectZipController.handle(any(), any())).thenReturn("");

		checkRoute("POST", "/api/projectzip");

		verify(projectZipController).handle(any(), any());
	}

	@Test
	public void markdown() throws IOException
	{
		// TODO checkRoute("POST", "/rendermarkdown");
	}

	@Test
	public void versions() throws IOException
	{
		checkRoute("GET", "/versions");
	}

	private void checkRoute(String method, String path) throws IOException
	{
		this.checkRoute(method, path, 200);
	}

	private void checkRoute(String method, String path, int status) throws IOException
	{
		final URL url = new URL("http", "localhost", 4567, path);

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
