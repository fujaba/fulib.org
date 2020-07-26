package org.fulib.webapp.assignment;

import org.fulib.webapp.assignment.model.Assignment;
import org.fulib.webapp.assignment.model.Task;
import org.fulib.webapp.mongo.Mongo;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import spark.HaltException;
import spark.Request;
import spark.Response;

import java.time.Instant;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Mockito.*;

public class AssignmentsTest
{
	private static final String ID = "1";
	private static final String TOKEN = "123";
	private static final String AUTHOR = "Testus";
	private static final String TITLE = "Test Example";
	private static final String DESCRIPTION = "An assignment for the test.";
	private static final String DESCRIPTION_HTML = "<p>An assignment for the test.</p>\n";
	private static final String EMAIL = "test@example.org";
	private static final String DEADLINE = "2030-01-01T12:00:00Z";
	private static final String SOLUTION = "There is a student with name Alice.";
	private static final String TEMPLATE_SOLUTION = "There is a ...";

	private static final String TASK0_DESCRIPTION = "Create a student object.";
	private static final int TASK0_POINTS = 5;
	private static final String TASK0_VERIFICATION = "We match some Student s1.";

	private static final String TASK1_DESCRIPTION = "Give the student the name Alice.";
	private static final int TASK1_POINTS = 10;
	private static final String TASK1_VERIFICATION = "We match some Student s1 with name Alice.";

	@Test
	public void create()
	{
		final Mongo db = mock(Mongo.class);
		final Assignments assignments = new Assignments(db);

		final Request request = mock(Request.class);

		final JSONObject requestObj = new JSONObject();
		requestObj.put("title", TITLE);
		requestObj.put("description", DESCRIPTION);
		requestObj.put("author", AUTHOR);
		requestObj.put("email", EMAIL);
		requestObj.put("deadline", DEADLINE);
		requestObj.put("solution", SOLUTION);
		requestObj.put("templateSolution", TEMPLATE_SOLUTION);

		final JSONObject task0Obj = new JSONObject();
		task0Obj.put("description", TASK0_DESCRIPTION);
		task0Obj.put("points", TASK0_POINTS);
		task0Obj.put("verification", TASK0_VERIFICATION);

		final JSONObject task1Obj = new JSONObject();
		task1Obj.put("description", TASK1_DESCRIPTION);
		task1Obj.put("points", TASK1_POINTS);
		task1Obj.put("verification", TASK1_VERIFICATION);

		requestObj.put("tasks", new JSONArray().put(task0Obj).put(task1Obj));

		final String requestBody = requestObj.toString();
		when(request.body()).thenReturn(requestBody);

		final Response response = mock(Response.class);

		final String responseBody = (String) assignments.create(request, response);
		final ArgumentCaptor<Assignment> assignmentCaptor = ArgumentCaptor.forClass(Assignment.class);

		verify(db).saveAssignment(assignmentCaptor.capture());

		final JSONObject responseObj = new JSONObject(responseBody);
		assertThat(responseObj.getString("id"), notNullValue());
		assertThat(responseObj.getString("token"), notNullValue());
		assertThat(responseObj.getString("descriptionHtml"), equalTo(DESCRIPTION_HTML));

		final Assignment assignment = assignmentCaptor.getValue();
		assertThat(assignment.getID(), notNullValue());
		assertThat(assignment.getToken(), notNullValue());
		assertThat(assignment.getTitle(), equalTo(TITLE));
		assertThat(assignment.getDescription(), equalTo(DESCRIPTION));
		assertThat(assignment.getDescriptionHtml(), equalTo(DESCRIPTION_HTML));
		assertThat(assignment.getAuthor(), equalTo(AUTHOR));
		assertThat(assignment.getEmail(), equalTo(EMAIL));
		assertThat(assignment.getDeadline(), equalTo(Instant.parse(DEADLINE)));
		assertThat(assignment.getSolution(), equalTo(SOLUTION));
		assertThat(assignment.getTemplateSolution(), equalTo(TEMPLATE_SOLUTION));

		final Task task0 = assignment.getTasks().get(0);
		assertThat(task0.getDescription(), equalTo(TASK0_DESCRIPTION));
		assertThat(task0.getPoints(), equalTo(TASK0_POINTS));
		assertThat(task0.getVerification(), equalTo(TASK0_VERIFICATION));

		final Task task1 = assignment.getTasks().get(1);
		assertThat(task1.getDescription(), equalTo(TASK1_DESCRIPTION));
		assertThat(task1.getPoints(), equalTo(TASK1_POINTS));
		assertThat(task1.getVerification(), equalTo(TASK1_VERIFICATION));
	}

	@Test
	public void get404()
	{
		final Mongo db = mock(Mongo.class);
		final Assignments assignments = new Assignments(db);

		final Request request = mock(Request.class);

		when(request.params("assignmentID")).thenReturn("-1");
		when(request.contentType()).thenReturn("application/json");
		when(db.getAssignment("-1")).thenReturn(null);

		final Response response = mock(Response.class);

		try
		{
			assignments.get(request, response);
			Assert.fail("did not throw HaltException");
		}
		catch (HaltException ex)
		{
			assertThat(ex.statusCode(), equalTo(404));
			final JSONObject body = new JSONObject(ex.body());
			assertThat(body.getString("error"), equalTo("assignment with id '-1'' not found")); // TODO '
		}
	}

	private Assignment createExampleAssignment()
	{
		final Assignment assignment = new Assignment(ID);
		assignment.setToken(TOKEN);
		assignment.setTitle(TITLE);
		assignment.setDescription(DESCRIPTION);
		assignment.setDescriptionHtml(DESCRIPTION_HTML);
		assignment.setAuthor(AUTHOR);
		assignment.setEmail(EMAIL);
		assignment.setDeadline(Instant.parse(DEADLINE));
		assignment.setSolution(SOLUTION);
		assignment.setTemplateSolution(TEMPLATE_SOLUTION);

		final Task task0 = new Task();
		task0.setDescription(TASK0_DESCRIPTION);
		task0.setPoints(TASK0_POINTS);
		task0.setVerification(TASK0_VERIFICATION);
		assignment.getTasks().add(task0);

		final Task task1 = new Task();
		task1.setDescription(TASK1_DESCRIPTION);
		task1.setPoints(TASK1_POINTS);
		task1.setVerification(TASK1_VERIFICATION);
		assignment.getTasks().add(task1);

		return assignment;
	}

	@Test
	public void getWithoutToken()
	{
		final Mongo db = mock(Mongo.class);
		final Assignments assignments = new Assignments(db);

		final Request request = mock(Request.class);

		when(request.params("assignmentID")).thenReturn(ID);
		when(request.contentType()).thenReturn("application/json");
		when(request.headers("Assignment-Token")).thenReturn(null);
		when(db.getAssignment(ID)).thenReturn(createExampleAssignment());

		final Response response = mock(Response.class);

		final String responseBody = (String) assignments.get(request, response);
		final JSONObject responseObj = new JSONObject(responseBody);

		assertThat(responseObj.has("id"), equalTo(false));
		assertThat(responseObj.has("token"), equalTo(false));
		assertThat(responseObj.getString("title"), equalTo(TITLE));
		assertThat(responseObj.getString("description"), equalTo(DESCRIPTION));
		assertThat(responseObj.getString("descriptionHtml"), equalTo(DESCRIPTION_HTML));
		assertThat(responseObj.getString("author"), equalTo(AUTHOR));
		assertThat(responseObj.getString("email"), equalTo(EMAIL));
		assertThat(responseObj.getString("deadline"), equalTo(DEADLINE));
		assertThat(responseObj.has("solution"), equalTo(false));
		assertThat(responseObj.getString("templateSolution"), equalTo(TEMPLATE_SOLUTION));

		final JSONObject task0 = responseObj.getJSONArray("tasks").getJSONObject(0);
		assertThat(task0.getString("description"), equalTo(TASK0_DESCRIPTION));
		assertThat(task0.getInt("points"), equalTo(TASK0_POINTS));
		assertThat(task0.has("verification"), equalTo(false));

		final JSONObject task1 = responseObj.getJSONArray("tasks").getJSONObject(1);
		assertThat(task1.getString("description"), equalTo(TASK1_DESCRIPTION));
		assertThat(task1.getInt("points"), equalTo(TASK1_POINTS));
		assertThat(task1.has("verification"), equalTo(false));
	}
}
