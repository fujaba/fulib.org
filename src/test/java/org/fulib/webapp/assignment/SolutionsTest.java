package org.fulib.webapp.assignment;

import org.fulib.webapp.assignment.model.Assignment;
import org.fulib.webapp.assignment.model.Solution;
import org.fulib.webapp.assignment.model.TaskResult;
import org.fulib.webapp.mongo.Mongo;
import org.hamcrest.CoreMatchers;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import spark.HaltException;
import spark.Request;
import spark.Response;

import java.util.List;
import java.util.concurrent.Callable;

import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.*;

public class SolutionsTest
{
	private static final String NAME = "Testus";
	private static final String EMAIL = "test@example.org";
	private static final String STUDENT_ID = "12345678";
	private static final String SOLUTION = "There is a Student.";

	@Test
	public void create404() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		when(request.params("assignmentID")).thenReturn("-1");
		when(db.getAssignment("-1")).thenReturn(null);

		check404(() -> solutions.create(request, response));
	}

	private void check404(Callable<?> runnable) throws Exception
	{
		try
		{
			runnable.call();
			fail("did not throw HaltException");
		}
		catch (HaltException ex)
		{
			assertThat(ex.statusCode(), equalTo(404));
			final JSONObject body = new JSONObject(ex.body());
			assertThat(body.getString("error"), equalTo("assignment with id '-1'' not found")); // TODO '
		}
	}

	@Test
	public void create() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final Assignment assignment = AssignmentsTest.createExampleAssignment();
		final String requestBody = createPostRequestBody();

		when(request.body()).thenReturn(requestBody);
		when(request.params("assignmentID")).thenReturn(assignment.getID());
		when(db.getAssignment(assignment.getID())).thenReturn(assignment);

		final String responseBody = (String) solutions.create(request, response);

		checkCreateResponse(responseBody);
		checkNewDbObject(db, assignment);
	}

	private String createPostRequestBody()
	{
		final JSONObject requestObj = new JSONObject();
		requestObj.put("name", NAME);
		requestObj.put("email", EMAIL);
		requestObj.put("studentID", STUDENT_ID);
		requestObj.put("solution", SOLUTION);
		return requestObj.toString();
	}

	private void checkCreateResponse(String responseBody)
	{
		final JSONObject responseObj = new JSONObject(responseBody);

		assertThat(responseObj.getString("id"), notNullValue());
		assertThat(responseObj.getString("token"), notNullValue());
		assertThat(responseObj.getString("timeStamp"), notNullValue());

		checkResults(responseObj);
	}

	private void checkResults(JSONObject responseObj)
	{
		final JSONArray results = responseObj.getJSONArray("results");

		final JSONObject result0 = results.getJSONObject(0);
		assertThat(result0.getString("output"), equalTo(""));
		assertThat(result0.getInt("points"), equalTo(5));

		final JSONObject result1 = results.getJSONObject(1);
		assertThat(result1.getString("output"), CoreMatchers.startsWith(
			"solution(assignment.SolutionTest)failed:\norg.fulib.patterns.NoMatchException: no matches for s1"));
		assertThat(result1.getInt("points"), equalTo(0));
	}

	private void checkNewDbObject(Mongo db, Assignment assignment)
	{
		final ArgumentCaptor<Solution> solutionCaptor = ArgumentCaptor.forClass(Solution.class);
		verify(db).saveSolution(solutionCaptor.capture());

		final Solution solution = solutionCaptor.getValue();

		assertThat(solution.getID(), notNullValue());
		assertThat(solution.getToken(), notNullValue());
		assertThat(solution.getAssignment(), sameInstance(assignment));
		assertThat(solution.getName(), equalTo(NAME));
		assertThat(solution.getEmail(), equalTo(EMAIL));
		assertThat(solution.getStudentID(), equalTo(STUDENT_ID));
		assertThat(solution.getTimeStamp(), notNullValue());
		assertThat(solution.getAssignee(), nullValue());

		final List<TaskResult> results = solution.getResults();

		final TaskResult result0 = results.get(0);
		assertThat(result0.getOutput(), equalTo(""));
		assertThat(result0.getPoints(), equalTo(5));

		final TaskResult result1 = results.get(1);
		assertThat(result1.getOutput(), CoreMatchers.startsWith(
			"solution(assignment.SolutionTest)failed:\norg.fulib.patterns.NoMatchException: no matches for s1"));
		assertThat(result1.getPoints(), equalTo(0));
	}

	@Test
	public void checkNoAssignment() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final JSONObject requestObj = new JSONObject();
		requestObj.put("tasks", AssignmentsTest.createTasksJSON());
		requestObj.put("solution", SOLUTION);
		final String requestBody = requestObj.toString();

		when(request.body()).thenReturn(requestBody);
		when(request.params("assignmentID")).thenReturn(null);

		final String responseBody = (String) solutions.check(request, response);
		final JSONObject responseObj = new JSONObject(responseBody);

		checkResults(responseObj);
	}

	@Test
	public void check404() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final JSONObject requestObj = new JSONObject();
		requestObj.put("solution", SOLUTION);
		final String requestBody = requestObj.toString();

		when(request.body()).thenReturn(requestBody);
		when(request.params("assignmentID")).thenReturn("-1");
		when(db.getAssignment("-1")).thenReturn(null);

		check404(() -> solutions.check(request, response));
	}

	@Test
	public void check() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final Assignment assignment = AssignmentsTest.createExampleAssignment();

		final JSONObject requestObj = new JSONObject();
		requestObj.put("solution", SOLUTION);
		final String requestBody = requestObj.toString();

		when(request.body()).thenReturn(requestBody);
		when(request.params("assignmentID")).thenReturn(assignment.getID());
		when(db.getAssignment(assignment.getID())).thenReturn(assignment);

		final String responseBody = (String) solutions.check(request, response);
		final JSONObject responseObj = new JSONObject(responseBody);

		checkResults(responseObj);
	}
}
