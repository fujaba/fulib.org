package org.fulib.webapp.assignment;

import org.fulib.webapp.assignment.model.Assignment;
import org.fulib.webapp.assignment.model.Solution;
import org.fulib.webapp.mongo.Mongo;
import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class Solutions
{
	public static Object create(Request request, Response response)
	{
		final Instant timeStamp = Instant.now();

		final String assignmentID = request.params("assignmentID");
		final Assignment assignment = Mongo.get().getAssignment(assignmentID);

		if (assignment == null)
		{
			response.status(404);
			// language=JSON
			return "{\n" + "  \"error\": \"assignment with id '" + assignmentID + "'' not found\"\n" + "}";
		}

		final String solutionID = IDGenerator.generateID();
		final String token = IDGenerator.generateToken();

		final Solution solution = fromJson(solutionID, new JSONObject(request.body()));
		solution.setAssignment(assignment);
		solution.setToken(token);
		solution.setTimeStamp(timeStamp);

		Mongo.get().saveSolution(solution);

		final JSONObject result = new JSONObject();
		result.put("id", solutionID);
		result.put("token", token);
		result.put("timeStamp", timeStamp.toString());
		return result.toString(2);
	}

	private static Solution fromJson(String id, JSONObject obj)
	{
		final Solution solution = new Solution(id);
		solution.setName(obj.getString(Solution.PROPERTY_name));
		solution.setStudentID(obj.getString(Solution.PROPERTY_studentID));
		solution.setEmail(obj.getString(Solution.PROPERTY_email));
		solution.setSolution(obj.getString(Solution.PROPERTY_solution));
		// don't include token!
		return solution;
	}

	public static Object get(Request request, Response response)
	{
		final String assignmentID = request.params("assignmentID");
		final String solutionID = request.params("solutionID");

		if (request.contentType() == null || !request.contentType().startsWith("application/json"))
		{
			response.redirect("/assignment/view.html?id=" + assignmentID + "&solution=" + solutionID);
			return "";
		}

		final Solution solution = Mongo.get().getSolution(solutionID);
		if (solution == null)
		{
			response.status(404);
			return "{}";
		}

		// NB: we use the assignment resolved via the solution, NOT the one we'd get from assignmentID!
		// Otherwise, someone could create their own assignment, forge the request with that assignment ID
		// and a solutionID belonging to a different assignment, and gain access to the solution without having
		// the token of the assignment it actually belongs to.

		final String token = request.headers("Assignment-Token");
		if (!token.equals(solution.getAssignment().getToken()))
		{
			response.status(401);
			// language=JSON
			return "{\n" + "  \"error\": \"invalid token\"\n" + "}\n";
		}

		final JSONObject obj = toJson(solution);
		return obj.toString(2);
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

		return obj;
	}

	public static Object getAll(Request request, Response response)
	{
		final String assignmentID = request.params("assignmentID");

		if (request.contentType() == null || !request.contentType().startsWith("application/json"))
		{
			response.redirect("/assignment/solutions.html?id=" + assignmentID);
			return "";
		}

		final Assignment assignment = Mongo.get().getAssignment(assignmentID);
		final String token = request.headers("Assignment-Token");

		if (!token.equals(assignment.getToken()))
		{
			response.status(401);
			// language=JSON
			return "{\n" + "  \"error\": \"invalid token\"\n" + "}\n";
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
}
