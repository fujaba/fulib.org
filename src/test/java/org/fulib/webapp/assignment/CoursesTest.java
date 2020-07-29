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

import java.util.Arrays;

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
	public void get404() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Courses courses = new Courses(db);

		final Request request = mock(Request.class);

		when(request.params("courseID")).thenReturn("-1");
		when(request.contentType()).thenReturn("application/json");
		when(db.getCourse("-1")).thenReturn(null);

		final Response response = mock(Response.class);

		TestHelper.expectHalt(404, "course with id '-1'' not found", () -> courses.get(request, response));
	}

	@Test
	public void get()
	{
		final Mongo db = mock(Mongo.class);
		final Courses courses = new Courses(db);

		final Request request = mock(Request.class);

		when(request.params("courseID")).thenReturn(ID);
		when(request.contentType()).thenReturn("application/json");
		when(db.getCourse(ID)).thenReturn(createExampleCourse());

		final Response response = mock(Response.class);

		final String responseBody = (String) courses.get(request, response);
		final JSONObject responseObj = new JSONObject(responseBody);

		assertThat(responseObj.getString("id"), equalTo(ID));
		assertThat(responseObj.getString("title"), equalTo(TITLE));
		assertThat(responseObj.getString("description"), equalTo(DESCRIPTION));
		assertThat(responseObj.getString("descriptionHtml"), equalTo(DESCRIPTION_HTML));

		final JSONArray assignmentIds = responseObj.getJSONArray("assignmentIds");
		assertThat(assignmentIds.getString(0), equalTo("a1"));
		assertThat(assignmentIds.getString(1), equalTo("a2"));
	}

	private Course createExampleCourse()
	{
		final Course course = new Course(ID);
		course.setTitle(TITLE);
		course.setDescription(DESCRIPTION);
		course.setDescriptionHtml(DESCRIPTION_HTML);
		course.setAssignmentIds(Arrays.asList("a1", "a2"));
		return course;
	}
}
