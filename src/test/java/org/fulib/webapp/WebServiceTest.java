package org.fulib.webapp;

import org.fulib.webapp.assignment.Assignments;
import org.fulib.webapp.assignment.Comments;
import org.fulib.webapp.assignment.Courses;
import org.fulib.webapp.assignment.Solutions;
import org.fulib.webapp.projects.Files;
import org.fulib.webapp.projects.Projects;
import org.fulib.webapp.projectzip.ProjectZip;
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

public class WebServiceTest
{
	private static final RunCodeGen runCodeGen = mock(RunCodeGen.class);
	private static final ProjectZip projectZip = mock(ProjectZip.class);
	private static final Projects projects = mock(Projects.class);
	private static final Files files = mock(Files.class);
	private static final Assignments assignments = mock(Assignments.class);
	private static final Comments comments = mock(Comments.class);
	private static final Solutions solutions = mock(Solutions.class);
	private static final Courses courses = mock(Courses.class);
	private static final WebService service = new WebService(runCodeGen, projectZip, projects, files, assignments,
	                                                         comments, solutions, courses);

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
	public void index() throws IOException
	{
		checkRoute("GET", "/index.html");
	}

	@Test
	public void github() throws IOException
	{
		checkRoute("GET", "/github", 302);
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
		when(projectZip.handle(any(), any())).thenReturn("");

		checkRoute("POST", "/projectzip");

		verify(projectZip).handle(any(), any());
	}

	@Test
	public void markdown() throws IOException
	{
		checkRoute("POST", "/rendermarkdown");
	}

	@Test
	public void projects() throws Exception
	{
		when(projects.get(any(), any())).thenReturn("");
		when(projects.getAll(any(), any())).thenReturn("");
		when(projects.create(any(), any())).thenReturn("");
		when(projects.update(any(), any())).thenReturn("");
		when(projects.delete(any(), any())).thenReturn("");

		checkRoute("POST", "/projects");
		checkRoute("GET", "/projects");
		checkRoute("GET", "/projects/1");
		checkRoute("PUT", "/projects/1");
		checkRoute("DELETE", "/projects/1");

		verify(projects).get(any(), any());
		verify(projects).getAll(any(), any());
		verify(projects).create(any(), any());
		verify(projects).update(any(), any());
		verify(projects).delete(any(), any());
	}

	@Test
	public void files() throws Exception
	{
		when(files.get(any(), any())).thenReturn("");
		when(files.getChildren(any(), any())).thenReturn("");
		when(files.create(any(), any())).thenReturn("");
		when(files.update(any(), any())).thenReturn("");
		when(files.delete(any(), any())).thenReturn("");

		checkRoute("POST", "/projects/p1/files");
		checkRoute("GET", "/projects/p1/files");
		checkRoute("GET", "/projects/p1/files/f1");
		checkRoute("PUT", "/projects/p1/files/f1");
		checkRoute("DELETE", "/projects/p1/files/f1");

		verify(files).get(any(), any());
		verify(files).getChildren(any(), any());
		verify(files).create(any(), any());
		verify(files).update(any(), any());
		verify(files).delete(any(), any());
	}

	@Test
	public void courses() throws IOException
	{
		when(courses.get(any(), any())).thenReturn("");
		when(courses.getAll(any(), any())).thenReturn("");
		when(courses.create(any(), any())).thenReturn("");

		checkRoute("POST", "/courses");
		checkRoute("GET", "/courses?userId=1");
		checkRoute("GET", "/courses/1");

		verify(courses).get(any(), any());
		verify(courses).getAll(any(), any());
		verify(courses).create(any(), any());
	}

	@Test
	public void assignments() throws Exception
	{
		when(assignments.get(any(), any())).thenReturn("");
		when(assignments.create(any(), any())).thenReturn("");
		when(solutions.check(any(), any())).thenReturn("");

		checkRoute("POST", "/assignments");
		checkRoute("POST", "/assignments/create/check");
		checkRoute("GET", "/assignments/1");
		checkRoute("POST", "/assignments/1/check");

		verify(assignments).get(any(), any());
		verify(assignments).create(any(), any());
		verify(solutions, times(2)).check(any(), any());
	}

	@Test
	public void solutions() throws Exception
	{
		when(solutions.get(any(), any())).thenReturn("");
		when(solutions.getAll(any(), any())).thenReturn("");
		when(solutions.getByAssignment(any(), any())).thenReturn("");
		when(solutions.create(any(), any())).thenReturn("");

		checkRoute("GET", "/solutions");
		checkRoute("POST", "/assignments/1/solutions");
		checkRoute("GET", "/assignments/1/solutions");
		checkRoute("GET", "/assignments/1/solutions/2");

		verify(solutions).get(any(), any());
		verify(solutions).getAll(any(), any());
		verify(solutions).getByAssignment(any(), any());
		verify(solutions).create(any(), any());
	}

	@Test
	public void gradings() throws IOException
	{
		when(solutions.getGradings(any(), any())).thenReturn("");
		when(solutions.postGrading(any(), any())).thenReturn("");

		checkRoute("GET", "/assignments/1/solutions/2/gradings");
		checkRoute("POST", "/assignments/1/solutions/2/gradings");

		verify(solutions).getGradings(any(), any());
		verify(solutions).postGrading(any(), any());
	}

	@Test
	public void assignee() throws IOException
	{
		when(solutions.getAssignee(any(), any())).thenReturn("");
		when(solutions.setAssignee(any(), any())).thenReturn("");

		checkRoute("GET", "/assignments/1/solutions/2/assignee");
		checkRoute("PUT", "/assignments/1/solutions/2/assignee");

		verify(solutions).getAssignee(any(), any());
		verify(solutions).setAssignee(any(), any());
	}

	@Test
	public void comments() throws IOException
	{
		when(comments.getChildren(any(), any())).thenReturn("");
		when(comments.post(any(), any())).thenReturn("");

		checkRoute("GET", "/assignments/1/solutions/2/comments");
		checkRoute("POST", "/assignments/1/solutions/2/comments");

		verify(comments).getChildren(any(), any());
		verify(comments).post(any(), any());
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
