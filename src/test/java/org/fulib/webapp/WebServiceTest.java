package org.fulib.webapp;

import org.fulib.webapp.assignment.Assignments;
import org.fulib.webapp.assignment.Comments;
import org.fulib.webapp.assignment.Courses;
import org.fulib.webapp.assignment.Solutions;
import org.fulib.webapp.projectzip.ProjectZip;
import org.fulib.webapp.tool.RunCodeGen;
import org.junit.Test;
import org.mockito.Mockito;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class WebServiceTest
{
	@Test
	public void start() throws Exception
	{
		final RunCodeGen runCodeGen = mock(RunCodeGen.class);
		final ProjectZip projectZip = mock(ProjectZip.class);
		final Assignments assignments = mock(Assignments.class);
		final Comments comments = mock(Comments.class);
		final Solutions solutions = mock(Solutions.class);
		final Courses courses = mock(Courses.class);

		when(runCodeGen.handle(any(), any())).thenReturn("");
		when(projectZip.handle(any(), any())).thenReturn("");

		when(courses.get(any(), any())).thenReturn("");
		when(courses.create(any(), any())).thenReturn("");

		when(assignments.get(any(), any())).thenReturn("");
		when(assignments.create(any(), any())).thenReturn("");

		when(solutions.get(any(), any())).thenReturn("");
		when(solutions.getAll(any(), any())).thenReturn("");
		when(solutions.getByAssignment(any(), any())).thenReturn("");
		when(solutions.check(any(), any())).thenReturn("");
		when(solutions.create(any(), any())).thenReturn("");
		when(solutions.getAssignee(any(), any())).thenReturn("");
		when(solutions.setAssignee(any(), any())).thenReturn("");
		when(solutions.getGradings(any(), any())).thenReturn("");
		when(solutions.postGrading(any(), any())).thenReturn("");

		when(comments.getChildren(any(), any())).thenReturn("");
		when(comments.post(any(), any())).thenReturn("");

		final WebService service = new WebService(runCodeGen, projectZip, assignments, comments, solutions, courses);
		service.start();
		service.awaitStart();

		try
		{
			checkRoute("GET", "/index.html");
			checkRoute("GET", "/github", 302);

			// main
			checkRoute("POST", "/runcodegen");
			checkRoute("POST", "/projectzip");
			checkRoute("POST", "/rendermarkdown");

			// courses
			checkRoute("POST", "/courses");
			checkRoute("GET", "/courses?userId=1");
			checkRoute("GET", "/courses/1");

			// assignments
			checkRoute("POST", "/assignments");
			checkRoute("POST", "/assignments/create/check");
			checkRoute("GET", "/assignments/1");
			checkRoute("POST", "/assignments/1/check");

			// solutions
			checkRoute("GET", "/solutions");

			checkRoute("POST", "/assignments/1/solutions");
			checkRoute("GET", "/assignments/1/solutions");
			checkRoute("GET", "/assignments/1/solutions/2");

			checkRoute("GET", "/assignments/1/solutions/2/assignee");
			checkRoute("PUT", "/assignments/1/solutions/2/assignee");

			checkRoute("GET", "/assignments/1/solutions/2/gradings");
			checkRoute("POST", "/assignments/1/solutions/2/gradings");

			checkRoute("GET", "/assignments/1/solutions/2/comments");
			checkRoute("POST", "/assignments/1/solutions/2/comments");
		}
		finally
		{
			service.awaitStop();
		}

		verify(runCodeGen).handle(any(), any());
		verify(projectZip).handle(any(), any());

		verify(courses).get(any(), any());
		verify(courses).getAll(any(), any());
		verify(courses).create(any(), any());

		verify(assignments).get(any(), any());
		verify(assignments).create(any(), any());

		verify(solutions).get(any(), any());
		verify(solutions).getAll(any(), any());
		verify(solutions).getByAssignment(any(), any());
		verify(solutions, times(2)).check(any(), any());
		verify(solutions).create(any(), any());
		verify(solutions).getAssignee(any(), any());
		verify(solutions).setAssignee(any(), any());
		verify(solutions).getGradings(any(), any());
		verify(solutions).postGrading(any(), any());

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
