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
import spark.Request;
import spark.Response;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.fulib.webapp.assignment.TestHelper.expectHalt;
import static org.hamcrest.CoreMatchers.*;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Mockito.*;

public class SolutionsTest
{
	private static final String NAME = "Testus";
	private static final String EMAIL = "test@example.org";
	private static final String STUDENT_ID = "12345678";
	private static final String SOLUTION = "There is a Student.";
	private static final String ID = "s1";
	private static final String TOKEN = "s123";
	private static final String TIMESTAMP = "2025-01-01T12:00:00Z";
	private static final String RESULT1_OUTPUT = "solution(assignment.SolutionTest)failed:" + System.lineSeparator()
	                                             + "org.fulib.patterns.NoMatchException: no matches for s1";
	private static final String ASSIGNEE = "Adrian";

	@Test
	public void create404() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		when(request.params("assignmentID")).thenReturn("-1");
		when(db.getAssignment("-1")).thenReturn(null);

		expectHalt(404, "assignment with id '-1'' not found", () -> solutions.create(request, response));
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
		assertThat(result1.getString("output"), CoreMatchers.startsWith(RESULT1_OUTPUT));
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
		assertThat(result1.getOutput(), CoreMatchers.startsWith(RESULT1_OUTPUT));
		assertThat(result1.getPoints(), equalTo(0));
	}

	@Test
	public void get404() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		when(request.contentType()).thenReturn("application/json");
		when(request.params("solutionID")).thenReturn("-1");

		expectHalt(404, "solution with id '-1'' not found", () -> solutions.get(request, response));
	}

	@Test
	public void getWrongAssignmentID() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final Solution solution = createSolution();
		final Assignment assignment = solution.getAssignment();

		when(db.getSolution(ID)).thenReturn(solution);
		when(db.getAssignment(assignment.getID())).thenReturn(assignment);
		when(request.contentType()).thenReturn("application/json");
		when(request.params("solutionID")).thenReturn(ID);
		when(request.params("assignmentID")).thenReturn("a2");

		expectHalt(400, "assignment ID from URL 'a2' does not match assignment ID of solution 'a1'",
		           () -> solutions.get(request, response));
	}

	@Test
	public void getWithoutToken() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final Solution solution = createSolution();
		final Assignment assignment = solution.getAssignment();

		when(db.getSolution(ID)).thenReturn(solution);
		when(db.getAssignment(assignment.getID())).thenReturn(assignment);
		when(request.contentType()).thenReturn("application/json");
		when(request.params("solutionID")).thenReturn(ID);
		when(request.params("assignmentID")).thenReturn(assignment.getID());

		expectHalt(401, "invalid Assignment-Token or Solution-Token", () -> solutions.get(request, response));
	}

	@Test
	public void getWithWrongAssignmentToken() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final Solution solution = createSolution();
		final Assignment assignment = solution.getAssignment();

		when(db.getSolution(ID)).thenReturn(solution);
		when(db.getAssignment(assignment.getID())).thenReturn(assignment);
		when(request.contentType()).thenReturn("application/json");
		when(request.params("solutionID")).thenReturn(ID);
		when(request.params("assignmentID")).thenReturn(assignment.getID());
		when(request.headers("Assignment-Token")).thenReturn("a456");

		expectHalt(401, "invalid Assignment-Token or Solution-Token", () -> solutions.get(request, response));
	}

	@Test
	public void getWithWrongSolutionToken() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final Solution solution = createSolution();
		final Assignment assignment = solution.getAssignment();

		when(db.getSolution(ID)).thenReturn(solution);
		when(db.getAssignment(assignment.getID())).thenReturn(assignment);
		when(request.contentType()).thenReturn("application/json");
		when(request.params("solutionID")).thenReturn(ID);
		when(request.params("assignmentID")).thenReturn(assignment.getID());
		when(request.headers("Solution-Token")).thenReturn("s456");

		expectHalt(401, "invalid Assignment-Token or Solution-Token", () -> solutions.get(request, response));
	}

	@Test
	public void getWithSolutionToken()
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final Solution solution = createSolution();
		final Assignment assignment = solution.getAssignment();

		when(db.getSolution(ID)).thenReturn(solution);
		when(db.getAssignment(assignment.getID())).thenReturn(assignment);
		when(request.contentType()).thenReturn("application/json");
		when(request.params("solutionID")).thenReturn(ID);
		when(request.params("assignmentID")).thenReturn(assignment.getID());
		when(request.headers("Solution-Token")).thenReturn(TOKEN);

		final String responseBody = (String) solutions.get(request, response);
		final JSONObject responseObj = new JSONObject(responseBody);

		checkGetResponse(responseObj, false);
	}

	@Test
	public void getWithAssignmentToken()
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final Solution solution = createSolution();
		final Assignment assignment = solution.getAssignment();

		when(db.getSolution(ID)).thenReturn(solution);
		when(db.getAssignment(assignment.getID())).thenReturn(assignment);
		when(request.contentType()).thenReturn("application/json");
		when(request.params("solutionID")).thenReturn(ID);
		when(request.params("assignmentID")).thenReturn(assignment.getID());
		when(request.headers("Assignment-Token")).thenReturn(assignment.getToken());

		final String responseBody = (String) solutions.get(request, response);
		final JSONObject responseObj = new JSONObject(responseBody);

		checkGetResponse(responseObj, true);
	}

	private void checkGetResponse(JSONObject responseObj, boolean privileged)
	{
		assertThat(responseObj.getString("id"), equalTo(ID));
		assertThat(responseObj.getString("assignment"), equalTo("a1"));
		assertThat(responseObj.getString("name"), equalTo(NAME));
		assertThat(responseObj.getString("studentID"), equalTo(STUDENT_ID));
		assertThat(responseObj.getString("email"), equalTo(EMAIL));
		assertThat(responseObj.getString("solution"), equalTo(SOLUTION));
		assertThat(responseObj.getString("timeStamp"), equalTo(TIMESTAMP));
		assertThat(responseObj.has("token"), equalTo(false));

		if (privileged)
		{
			assertThat(responseObj.getString("assignee"), equalTo(ASSIGNEE));
		}
		else
		{
			assertThat(responseObj.has("assignee"), equalTo(false));
		}

		final JSONArray results = responseObj.getJSONArray("results");

		final JSONObject result0 = results.getJSONObject(0);
		assertThat(result0.getString("output"), equalTo(""));
		assertThat(result0.getInt("points"), equalTo(5));

		final JSONObject result1 = results.getJSONObject(1);
		assertThat(result1.getString("output"), CoreMatchers.startsWith(RESULT1_OUTPUT));
		assertThat(result1.getInt("points"), equalTo(0));
	}

	private static Solution createSolution()
	{
		final Solution solution = new Solution(ID);
		solution.setToken(TOKEN);
		solution.setAssignment(AssignmentsTest.createExampleAssignment());
		solution.setName(NAME);
		solution.setStudentID(STUDENT_ID);
		solution.setEmail(EMAIL);
		solution.setSolution(SOLUTION);
		solution.setTimeStamp(Instant.parse(TIMESTAMP));
		solution.setAssignee(ASSIGNEE);

		final TaskResult result0 = new TaskResult();
		result0.setOutput("");
		result0.setPoints(5);
		solution.getResults().add(result0);

		final TaskResult result1 = new TaskResult();
		result1.setOutput(RESULT1_OUTPUT);
		result1.setPoints(0);
		solution.getResults().add(result1);

		return solution;
	}

	@Test
	public void getAll404() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		when(request.contentType()).thenReturn("application/json");
		when(request.params("assignmentID")).thenReturn("-1");

		expectHalt(404, "assignment with id '-1'' not found", () -> solutions.getAll(request, response));
	}

	@Test
	public void getAllWithoutToken() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final Solution solution = createSolution();
		final Assignment assignment = solution.getAssignment();

		when(db.getSolution(ID)).thenReturn(solution);
		when(db.getAssignment(assignment.getID())).thenReturn(assignment);
		when(request.contentType()).thenReturn("application/json");
		when(request.params("assignmentID")).thenReturn(assignment.getID());

		expectHalt(401, "invalid Assignment-Token", () -> solutions.getAll(request, response));
	}

	@Test
	public void getAllWithWrongToken() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final Solution solution = createSolution();
		final Assignment assignment = solution.getAssignment();

		when(db.getSolution(ID)).thenReturn(solution);
		when(db.getAssignment(assignment.getID())).thenReturn(assignment);
		when(request.contentType()).thenReturn("application/json");
		when(request.params("assignmentID")).thenReturn(assignment.getID());
		when(request.headers("Assignment-Token")).thenReturn("a456");

		expectHalt(401, "invalid Assignment-Token", () -> solutions.getAll(request, response));
	}

	@Test
	public void getAll()
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final Solution solution = createSolution();
		final Assignment assignment = solution.getAssignment();

		when(db.getAssignment(assignment.getID())).thenReturn(assignment);
		when(db.getSolutions(assignment.getID())).thenReturn(Collections.singletonList(solution));
		when(request.contentType()).thenReturn("application/json");
		when(request.params("assignmentID")).thenReturn(assignment.getID());
		when(request.headers("Assignment-Token")).thenReturn(assignment.getToken());

		final String responseBody = (String) solutions.getAll(request, response);
		final JSONObject responseObj = new JSONObject(responseBody);

		assertThat(responseObj.getInt("count"), equalTo(1));

		final JSONArray solutionArray = responseObj.getJSONArray("solutions");
		assertThat(solutionArray.length(), equalTo(1));

		checkGetResponse(solutionArray.getJSONObject(0), true);
	}

	@Test
	public void getAssignee404() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		when(db.getSolution("-1")).thenReturn(null);
		when(request.params("solutionID")).thenReturn("-1");

		expectHalt(404, "solution with id '-1'' not found", () -> solutions.getAssignee(request, response));
	}

	@Test
	public void getAssigneeWrongAssignmentID() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final Solution solution = createSolution();
		final Assignment assignment = solution.getAssignment();

		when(db.getSolution(ID)).thenReturn(solution);
		when(db.getAssignment(assignment.getID())).thenReturn(assignment);
		when(request.params("solutionID")).thenReturn(ID);
		when(request.params("assignmentID")).thenReturn("a2");

		expectHalt(400, "assignment ID from URL 'a2' does not match assignment ID of solution 'a1'",
		           () -> solutions.getAssignee(request, response));
	}

	@Test
	public void getAssigneeWithoutToken() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final Solution solution = createSolution();
		final Assignment assignment = solution.getAssignment();

		when(db.getSolution(ID)).thenReturn(solution);
		when(db.getAssignment(assignment.getID())).thenReturn(assignment);
		when(request.contentType()).thenReturn("application/json");
		when(request.params("solutionID")).thenReturn(ID);
		when(request.params("assignmentID")).thenReturn(assignment.getID());

		expectHalt(401, "invalid Assignment-Token", () -> solutions.getAssignee(request, response));
	}

	@Test
	public void getAssigneeWithWrongToken() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final Solution solution = createSolution();
		final Assignment assignment = solution.getAssignment();

		when(db.getSolution(ID)).thenReturn(solution);
		when(db.getAssignment(assignment.getID())).thenReturn(assignment);
		when(request.contentType()).thenReturn("application/json");
		when(request.params("solutionID")).thenReturn(ID);
		when(request.params("assignmentID")).thenReturn(assignment.getID());
		when(request.headers("Assignment-Token")).thenReturn("a456");

		expectHalt(401, "invalid Assignment-Token", () -> solutions.getAssignee(request, response));
	}

	@Test
	public void getAssignee()
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		final Solution solution = createSolution();
		final Assignment assignment = solution.getAssignment();

		when(db.getSolution(ID)).thenReturn(solution);
		when(db.getAssignment(assignment.getID())).thenReturn(assignment);
		when(request.contentType()).thenReturn("application/json");
		when(request.params("solutionID")).thenReturn(ID);
		when(request.params("assignmentID")).thenReturn(assignment.getID());
		when(request.headers("Assignment-Token")).thenReturn(assignment.getToken());

		final String responseBody = (String) solutions.getAssignee(request, response);
		final JSONObject responseObj = new JSONObject(responseBody);

		assertThat(responseObj.getString("assignee"), equalTo(ASSIGNEE));
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

		expectHalt(404, "assignment with id '-1'' not found", () -> solutions.check(request, response));
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
