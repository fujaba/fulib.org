package org.fulib.webapp.assignment;

import org.fulib.webapp.assignment.model.Assignment;
import org.fulib.webapp.assignment.model.Solution;
import org.fulib.webapp.mongo.Mongo;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import java.util.UUID;

public class Solutions
{
	public static Object create(Request request, Response response)
	{
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

		Mongo.get().saveSolution(solution);

		final JSONObject result = new JSONObject();
		result.put("solutionID", solutionID);
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
}
