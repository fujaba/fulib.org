package org.fulib.webapp.assignment;

import org.fulib.webapp.assignment.model.Course;
import org.fulib.webapp.mongo.Mongo;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import spark.HaltException;
import spark.Request;
import spark.Response;

import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Mockito.*;

public class CoursesTest
{
	private static final String ID = "1";
	private static final String TITLE = "Test Course";
	private static final String DESCRIPTION = "A course for the test.";
	private static final String DESCRIPTION_HTML = "<p>A course for the test.</p>\n";

	@Test
	public void create()
	{
		final Mongo db = mock(Mongo.class);
		final Courses courses = new Courses(db);

		final Request request = mock(Request.class);

		final JSONObject requestObj = new JSONObject();
		requestObj.put("title", TITLE);
		requestObj.put("description", DESCRIPTION);

		requestObj.put("assignmentIds", new JSONArray().put("a1").put("a2"));

		final String requestBody = requestObj.toString();
		when(request.body()).thenReturn(requestBody);

		final Response response = mock(Response.class);

		final String responseBody = (String) courses.create(request, response);
		final ArgumentCaptor<Course> courseCaptor = ArgumentCaptor.forClass(Course.class);

		verify(db).saveCourse(courseCaptor.capture());

		final JSONObject responseObj = new JSONObject(responseBody);
		assertThat(responseObj.getString("id"), notNullValue());
		assertThat(responseObj.getString("descriptionHtml"), equalTo(DESCRIPTION_HTML));

		final Course course = courseCaptor.getValue();
		assertThat(course.getId(), notNullValue());
		assertThat(course.getTitle(), equalTo(TITLE));
		assertThat(course.getDescription(), equalTo(DESCRIPTION));
		assertThat(course.getDescriptionHtml(), equalTo(DESCRIPTION_HTML));
		assertThat(course.getAssignmentIds(), hasItems("a1", "a2"));
	}

	@Test
	public void get404()
	{
		final Mongo db = mock(Mongo.class);
		final Courses courses = new Courses(db);

		final Request request = mock(Request.class);

		when(request.params("courseID")).thenReturn("-1");
		when(request.contentType()).thenReturn("application/json");
		when(db.getCourse("-1")).thenReturn(null);

		final Response response = mock(Response.class);

		try
		{
			courses.get(request, response);
			Assert.fail("did not throw HaltException");
		}
		catch (HaltException ex)
		{
			assertThat(ex.statusCode(), equalTo(404));
			final JSONObject body = new JSONObject(ex.body());
			assertThat(body.getString("error"), equalTo("course with id '-1'' not found")); // TODO '
		}
	}
}
