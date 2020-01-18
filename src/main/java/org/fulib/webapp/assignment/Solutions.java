package org.fulib.webapp.assignment;

import org.fulib.webapp.assignment.model.Assignment;
import org.fulib.webapp.assignment.model.Solution;
import org.fulib.webapp.mongo.Mongo;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import java.time.Instant;
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

		// TODO check deadline

		final String solutionID = UUID.randomUUID().toString();
		final Solution solution = fromJson(solutionID, assignment, new JSONObject(request.body()));
		solution.setTimeStamp(timeStamp);

		Mongo.get().saveSolution(solution);

		final JSONObject result = new JSONObject();
		result.put("solutionID", solutionID);
		result.put("timeStamp", timeStamp.toString());
		return result.toString(2);
	}

	private static Solution fromJson(String id, Assignment assignment, JSONObject obj)
	{
		final Solution solution = new Solution(id);
		solution.setAssignment(assignment);
		solution.setName(obj.getString(Solution.PROPERTY_name));
		solution.setStudentID(obj.getString(Solution.PROPERTY_studentID));
		solution.setEmail(obj.getString(Solution.PROPERTY_email));
		solution.setSolution(obj.getString(Solution.PROPERTY_solution));
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

		// TODO check auth header

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

		return obj;
	}
}
