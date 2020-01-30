package org.fulib.webapp.assignment;

import org.fulib.webapp.assignment.model.Assignment;
import org.fulib.webapp.assignment.model.Solution;
import org.fulib.webapp.assignment.model.Task;
import org.fulib.webapp.assignment.model.TaskResult;
import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.tool.RunCodeGen;
import org.fulib.webapp.tool.model.CodeGenData;
import org.fulib.webapp.tool.model.Result;
import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class Solutions
{
	private static final String SOLUTION_ID_QUERY_PARAM = "solutionID";
	private static final String ASSIGNMENT_ID_QUERY_PARAM = "assignmentID";

	private static final String SOLUTION_TOKEN_HEADER = "Solution-Token";
	private static final String ASSIGNMENT_TOKEN_HEADER = "Assignment-Token";

	// language=JSON
	private static final String INVALID_TOKEN_RESPONSE = "{\n" + "  \"error\": \"invalid token\"\n" + "}\n";
	// language=JSON
	private static final String UNKNOWN_ASSIGNMENT_RESPONSE = "{\n  \"error\": \"assignment with id '%s'' not found\"\n}";
	private static final String UNKNOWN_SOLUTION_RESPONSE = "{\n  \"error\": \"solution with id '%s'' not found\"\n}";

	// --------------- Submission ---------------

	public static Object create(Request request, Response response) throws Exception
	{
		final Instant timeStamp = Instant.now();

		final String assignmentID = request.params(ASSIGNMENT_ID_QUERY_PARAM);
		final Assignment assignment = Mongo.get().getAssignment(assignmentID);

		if (assignment == null)
		{
			response.status(404);
			return String.format(UNKNOWN_ASSIGNMENT_RESPONSE, assignmentID);
		}

		final String solutionID = IDGenerator.generateID();
		final String token = IDGenerator.generateToken();

		final Solution solution = fromJson(solutionID, new JSONObject(request.body()));
		solution.setAssignment(assignment);
		solution.setToken(token);
		solution.setTimeStamp(timeStamp);

		final List<TaskResult> results = runTasks(solution.getSolution(), assignment.getTasks());
		solution.getResults().addAll(results);

		Mongo.get().saveSolution(solution);

		final JSONObject result = new JSONObject();
		result.put(Solution.PROPERTY_id, solutionID);
		result.put(Solution.PROPERTY_token, token);
		result.put(Solution.PROPERTY_timeStamp, timeStamp.toString());
		return result.toString(2);
	}

	private static Solution fromJson(String id, JSONObject obj)
	{
		final Solution solution = new Solution(id);
		// assignment set from query parameter
		// id, token, timestamp and results generated server-side
		solution.setName(obj.getString(Solution.PROPERTY_name));
		solution.setStudentID(obj.getString(Solution.PROPERTY_studentID));
		solution.setEmail(obj.getString(Solution.PROPERTY_email));
		solution.setSolution(obj.getString(Solution.PROPERTY_solution));
		return solution;
	}

	// --------------- Read ---------------

	public static Object get(Request request, Response response)
	{
		final String assignmentID = request.params(ASSIGNMENT_ID_QUERY_PARAM);
		final String solutionID = request.params(SOLUTION_ID_QUERY_PARAM);

		if (request.contentType() == null || !request.contentType().startsWith("application/json"))
		{
			response.redirect("/assignment/solution.html?id=" + assignmentID + "&solution=" + solutionID);
			return "";
		}

		final Solution solution = Mongo.get().getSolution(solutionID);
		if (solution == null)
		{
			response.status(404);
			return String.format(UNKNOWN_SOLUTION_RESPONSE, solutionID);
		}

		// NB: we use the assignment resolved via the solution, NOT the one we'd get from assignmentID!
		// Otherwise, someone could create their own assignment, forge the request with that assignment ID
		// and a solutionID belonging to a different assignment, and gain access to the solution without having
		// the token of the assignment it actually belongs to.
		if (!isAuthorized(request, solution) && !isAuthorized(request, solution.getAssignment()))
		{
			response.status(401);
			return INVALID_TOKEN_RESPONSE;
		}

		final JSONObject obj = toJson(solution);
		return obj.toString(2);
	}

	private static boolean isAuthorized(Request request, Solution solution)
	{
		final String solutionToken = solution.getToken();
		final String solutionTokenHeader = request.headers(SOLUTION_TOKEN_HEADER);
		return solutionToken.equals(solutionTokenHeader);
	}

	private static boolean isAuthorized(Request request, Assignment assignment)
	{
		final String assignmentToken = assignment.getToken();
		final String assignmentTokenHeader = request.headers(ASSIGNMENT_TOKEN_HEADER);
		return assignmentToken.equals(assignmentTokenHeader);
	}

	public static Object getAll(Request request, Response response)
	{
		final String assignmentID = request.params(ASSIGNMENT_ID_QUERY_PARAM);

		if (request.contentType() == null || !request.contentType().startsWith("application/json"))
		{
			response.redirect("/assignment/solutions.html?id=" + assignmentID);
			return "";
		}

		final Assignment assignment = Mongo.get().getAssignment(assignmentID);
		if (assignment == null)
		{
			response.status(404);
			return String.format(UNKNOWN_ASSIGNMENT_RESPONSE, assignmentID);
		}

		if (isAuthorized(request, assignment))
		{
			response.status(401);
			return INVALID_TOKEN_RESPONSE;
		}

		final List<Solution> solutions = Mongo.get().getSolutions(assignmentID);

		final JSONObject result = new JSONObject();

		result.put("count", solutions.size());

		final JSONArray array = new JSONArray();

		for (final Solution solution : solutions)
		{
			array.put(toJson(solution));
		}

		result.put("solutions", array);

		return result.toString(2);
	}

	private static JSONObject toJson(Solution solution)
	{
		final JSONObject obj = new JSONObject();

		obj.put(Solution.PROPERTY_id, solution.getID());
		obj.put(Solution.PROPERTY_assignment, solution.getAssignment().getID());
		obj.put(Solution.PROPERTY_name, solution.getName());
		obj.put(Solution.PROPERTY_studentID, solution.getStudentID());
		obj.put(Solution.PROPERTY_email, solution.getEmail());
		obj.put(Solution.PROPERTY_solution, solution.getSolution());
		obj.put(Solution.PROPERTY_timeStamp, solution.getTimeStamp());
		// don't include token!

		final JSONArray results = new JSONArray();
		for (final TaskResult result : solution.getResults())
		{
			final JSONObject resultObj = toJson(result);
			results.put(resultObj);
		}
		obj.put(Solution.PROPERTY_results, results);

		obj.put(Solution.PROPERTY_assignee, solution.getAssignee());

		return obj;
	}

	// --------------- Assignees ---------------

	public static Object getAssignee(Request request, Response response)
	{
		final String solutionID = request.params("solutionID");
		final Solution solution = Mongo.get().getSolution(solutionID);

		if (solution == null)
		{
			response.status(404);
			return String.format(UNKNOWN_SOLUTION_RESPONSE, solutionID);
		}

		if (!isAuthorized(request, solution.getAssignment()))
		{
			response.status(401);
			return INVALID_TOKEN_RESPONSE;
		}

		final JSONObject result = new JSONObject();
		result.put(Solution.PROPERTY_assignee, solution.getAssignee());
		return result.toString(2);
	}

	public static Object setAssignee(Request request, Response response)
	{
		final String solutionID = request.params("solutionID");

		final JSONObject body = new JSONObject(request.body());
		final String assignee = body.getString(Solution.PROPERTY_assignee);

		final Solution solution = Mongo.get().getSolution(solutionID);

		if (solution == null)
		{
			response.status(404);
			return String.format(UNKNOWN_SOLUTION_RESPONSE, solutionID);
		}

		if (!isAuthorized(request, solution.getAssignment()))
		{
			response.status(401);
			return INVALID_TOKEN_RESPONSE;
		}

		Mongo.get().saveAssignee(solutionID, assignee);

		return "{}";
	}

	// --------------- Checking ---------------

	public static Object check(Request request, Response response) throws Exception
	{
		final String assignmentID = request.params(ASSIGNMENT_ID_QUERY_PARAM);
		final Assignment assignment = Mongo.get().getAssignment(assignmentID);

		if (assignment == null)
		{
			response.status(404);
			return String.format(UNKNOWN_ASSIGNMENT_RESPONSE, assignmentID);
		}

		final JSONObject requestObj = new JSONObject(request.body());
		final String solution = requestObj.getString(Solution.PROPERTY_solution);

		final List<TaskResult> results = runTasks(solution, assignment.getTasks());

		final JSONObject resultObj = new JSONObject();
		final JSONArray resultsArray = new JSONArray();

		for (final TaskResult result : results)
		{
			final JSONObject taskObj = toJson(result);
			resultsArray.put(taskObj);
		}

		resultObj.put(Solution.PROPERTY_results, resultsArray);

		return resultObj.toString(2);
	}

	private static List<TaskResult> runTasks(String solution, List<Task> tasks) throws Exception
	{
		final List<TaskResult> results = new ArrayList<>(tasks.size());
		for (final Task task : tasks)
		{
			final TaskResult result = runTask(solution, task);
			results.add(result);
		}
		return results;
	}

	private static TaskResult runTask(String solution, Task task) throws Exception
	{
		final String scenario =
			"# Solution\n\n" + solution + "\n\n## Verification\n\n" + task.getVerification() + "\n\n";

		final CodeGenData input = new CodeGenData();
		input.setScenarioText(scenario);
		input.setPackageName("assignment");
		input.setScenarioFileName("solution.md");

		// TODO make it ignore diagrams and methods
		final Result result = RunCodeGen.run(input);

		final int points = result.getExitCode() == 0 ? task.getPoints() : 0;
		final TaskResult taskResult = new TaskResult();
		taskResult.setPoints(points);
		taskResult.setOutput(result.getOutput());
		return taskResult;
	}

	private static JSONObject toJson(TaskResult taskResult)
	{
		final JSONObject obj = new JSONObject();
		obj.put(TaskResult.PROPERTY_points, taskResult.getPoints());
		obj.put(TaskResult.PROPERTY_output, taskResult.getOutput());
		return obj;
	}
}
