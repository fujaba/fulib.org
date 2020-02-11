package org.fulib.webapp.assignment;

import org.fulib.webapp.WebService;
import org.fulib.webapp.assignment.model.Assignment;
import org.fulib.webapp.assignment.model.Task;
import org.fulib.webapp.mongo.Mongo;
import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;
import spark.Spark;

import java.time.Instant;

public class Assignments
{
	// =============== Constants ===============

	private static final String ASSIGNMENT_TOKEN_HEADER = "Assignment-Token";

	// language=JSON
	private static final String INVALID_TOKEN_RESPONSE = "{\n" + "  \"error\": \"invalid Assignment-Token\"\n" + "}\n";
	// language=JSON
	static final String UNKNOWN_ASSIGNMENT_RESPONSE = "{\n  \"error\": \"assignment with id '%s'' not found\"\n}";

	// =============== Static Methods ===============

	static Assignment getAssignmentOr404(String id)
	{
		final Assignment assignment = Mongo.get().getAssignment(id);
		if (assignment == null)
		{
			Spark.halt(404, String.format(UNKNOWN_ASSIGNMENT_RESPONSE, id));
		}
		return assignment;
	}

	static void checkPrivilege(Request request, Assignment assignment)
	{
		if (!isAuthorized(request, assignment))
		{
			Spark.halt(401, INVALID_TOKEN_RESPONSE);
		}
	}

	static boolean isAuthorized(Request request, Assignment assignment)
	{
		final String assignmentToken = assignment.getToken();
		final String assignmentTokenHeader = request.headers(ASSIGNMENT_TOKEN_HEADER);
		return assignmentToken.equals(assignmentTokenHeader);
	}

	public static Object create(Request request, Response response)
	{
		final String id = IDGenerator.generateID();
		final String token = IDGenerator.generateToken();
		final Assignment assignment = fromJson(id, new JSONObject(request.body()));
		assignment.setToken(token);

		final String descriptionHtml = MarkdownUtil.renderHtml(assignment.getDescription());
		assignment.setDescriptionHtml(descriptionHtml);

		Mongo.get().saveAssignment(assignment);

		JSONObject responseJson = new JSONObject();

		responseJson.put(Assignment.PROPERTY_id, id);
		responseJson.put(Assignment.PROPERTY_token, token);

		return responseJson.toString(2);
	}

	private static Assignment fromJson(String id, JSONObject obj)
	{
		final Assignment assignment = new Assignment(id);

		// id, token and description html generated server-side
		assignment.setTitle(obj.getString(Assignment.PROPERTY_title));
		assignment.setDescription(obj.getString(Assignment.PROPERTY_description));
		assignment.setAuthor(obj.getString(Assignment.PROPERTY_author));
		assignment.setEmail(obj.getString(Assignment.PROPERTY_email));
		assignment.setDeadline(Instant.parse(obj.getString(Assignment.PROPERTY_deadline)));
		assignment.setSolution(obj.getString(Assignment.PROPERTY_solution));

		for (final Object taskItem : obj.getJSONArray(Assignment.PROPERTY_tasks))
		{
			final JSONObject taskObj = (JSONObject) taskItem;

			final Task task = new Task();
			task.setDescription(taskObj.getString(Task.PROPERTY_description));
			task.setPoints(taskObj.getInt(Task.PROPERTY_points));
			task.setVerification(taskObj.getString(Task.PROPERTY_verification));
			assignment.getTasks().add(task);
		}

		return assignment;
	}

	public static Object get(Request request, Response response)
	{
		final String id = request.params("assignmentID");

		if (request.contentType() == null || !request.contentType().startsWith("application/json"))
		{
			return WebService.serveIndex(request, response);
		}

		Assignment assignment = getAssignmentOr404(id);
		final JSONObject obj = toJson(assignment);
		return obj.toString(2);
	}

	private static JSONObject toJson(Assignment assignment)
	{
		final JSONObject obj = new JSONObject();
		obj.put(Assignment.PROPERTY_title, assignment.getTitle());
		obj.put(Assignment.PROPERTY_description, assignment.getDescription());
		obj.put(Assignment.PROPERTY_descriptionHtml, assignment.getDescriptionHtml());
		obj.put(Assignment.PROPERTY_author, assignment.getAuthor());
		obj.put(Assignment.PROPERTY_email, assignment.getEmail());
		obj.put(Assignment.PROPERTY_deadline, assignment.getDeadline().toString());
		// do NOT include solution or token!

		final JSONArray tasks = new JSONArray();
		for (final Task task : assignment.getTasks())
		{
			JSONObject taskObj = new JSONObject();
			taskObj.put(Task.PROPERTY_description, task.getDescription());
			taskObj.put(Task.PROPERTY_points, task.getPoints()); // TODO do we really want to expose these?
			// exclude verification
			tasks.put(taskObj);
		}
		obj.put(Assignment.PROPERTY_tasks, tasks);
		return obj;
	}
}
