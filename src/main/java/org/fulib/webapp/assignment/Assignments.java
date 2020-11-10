package org.fulib.webapp.assignment;

import org.fulib.webapp.WebService;
import org.fulib.webapp.assignment.model.Assignment;
import org.fulib.webapp.assignment.model.Task;
import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.tool.Authenticator;
import org.fulib.webapp.tool.IDGenerator;
import org.fulib.webapp.tool.MarkdownUtil;
import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;
import spark.Spark;

import java.time.Instant;
import java.util.List;

public class Assignments
{
	// =============== Constants ===============

	private static final String ASSIGNMENT_TOKEN_HEADER = "Assignment-Token";

	// language=JSON
	private static final String INVALID_TOKEN_RESPONSE = "{\n" + "  \"error\": \"invalid Assignment-Token\"\n" + "}\n";
	// language=JSON
	static final String UNKNOWN_ASSIGNMENT_RESPONSE = "{\n  \"error\": \"assignment with id '%s'' not found\"\n}";

	// =============== Fields ===============

	private final MarkdownUtil markdownUtil;
	private final Mongo mongo;

	// =============== Constructors ===============

	public Assignments(MarkdownUtil markdownUtil, Mongo mongo)
	{
		this.markdownUtil = markdownUtil;
		this.mongo = mongo;
	}

	// =============== Static Methods ===============

	static Assignment getAssignmentOr404(Mongo mongo, String id)
	{
		final Assignment assignment = mongo.getAssignment(id);
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
		final String userId = Authenticator.getUserId(request);
		if (userId != null && userId.equals(assignment.getUserId()))
		{
			return true;
		}

		final String assignmentToken = assignment.getToken();
		final String assignmentTokenHeader = request.headers(ASSIGNMENT_TOKEN_HEADER);
		return assignmentToken.equals(assignmentTokenHeader);
	}

	public Object create(Request request, Response response)
	{
		final String id = IDGenerator.generateID();
		final String token = IDGenerator.generateToken();
		final Assignment assignment = fromJson(id, new JSONObject(request.body()));
		assignment.setToken(token);

		final String userId = Authenticator.getUserId(request);
		if (userId != null)
		{
			assignment.setUserId(userId);
		}

		final String descriptionHtml = this.markdownUtil.renderHtml(assignment.getDescription());
		assignment.setDescriptionHtml(descriptionHtml);

		this.mongo.saveAssignment(assignment);

		JSONObject responseJson = new JSONObject();

		responseJson.put(Assignment.PROPERTY_id, id);
		responseJson.put(Assignment.PROPERTY_token, token);
		responseJson.put(Assignment.PROPERTY_userId, userId);
		responseJson.put(Assignment.PROPERTY_descriptionHtml, descriptionHtml);

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
		final String deadline = obj.optString(Assignment.PROPERTY_deadline, null);
		if (deadline != null)
		{
			assignment.setDeadline(Instant.parse(deadline));
		}
		assignment.setSolution(obj.getString(Assignment.PROPERTY_solution));
		assignment.setTemplateSolution(obj.getString(Assignment.PROPERTY_templateSolution));

		for (final Object taskItem : obj.getJSONArray(Assignment.PROPERTY_tasks))
		{
			final JSONObject taskObj = (JSONObject) taskItem;

			final Task task = json2Task(taskObj);
			assignment.getTasks().add(task);
		}

		return assignment;
	}

	static Task json2Task(JSONObject taskObj)
	{
		final Task task = new Task();
		task.setDescription(taskObj.getString(Task.PROPERTY_description));
		task.setPoints(taskObj.getInt(Task.PROPERTY_points));
		task.setVerification(taskObj.getString(Task.PROPERTY_verification));
		return task;
	}

	public Object get(Request request, Response response)
	{
		if (WebService.shouldServiceIndex(request))
		{
			return WebService.serveIndex(request, response);
		}

		final String id = request.params("assignmentID");
		Assignment assignment = getAssignmentOr404(this.mongo, id);
		final boolean privileged = isAuthorized(request, assignment);
		final JSONObject obj = toJson(assignment, privileged);
		return obj.toString(2);
	}

	public Object getAll(Request request, Response response)
	{
		if (WebService.shouldServiceIndex(request))
		{
			return WebService.serveIndex(request, response);
		}

		final String userId = Authenticator.getAndCheckUserIdQueryParam(request);

		final List<Assignment> assignments = this.mongo.getAssignmentsByUser(userId);
		final JSONArray array = new JSONArray();
		for (final Assignment assignment : assignments)
		{
			array.put(toJson(assignment, true));
		}
		return array.toString(2);
	}

	private static JSONObject toJson(Assignment assignment, boolean privileged)
	{
		final JSONObject obj = new JSONObject();
		obj.put(Assignment.PROPERTY_id, assignment.getID());
		obj.put(Assignment.PROPERTY_title, assignment.getTitle());
		obj.put(Assignment.PROPERTY_description, assignment.getDescription());
		obj.put(Assignment.PROPERTY_descriptionHtml, assignment.getDescriptionHtml());
		obj.put(Assignment.PROPERTY_userId, assignment.getUserId());
		obj.put(Assignment.PROPERTY_author, assignment.getAuthor());
		obj.put(Assignment.PROPERTY_email, assignment.getEmail());
		final Instant deadline = assignment.getDeadline();
		if (deadline != null)
		{
			obj.put(Assignment.PROPERTY_deadline, deadline.toString());
		}
		obj.put(Assignment.PROPERTY_templateSolution, assignment.getTemplateSolution());
		// do NOT include token!

		if (privileged)
		{
			obj.put(Assignment.PROPERTY_solution, assignment.getSolution());
		}

		final JSONArray tasks = new JSONArray();
		for (final Task task : assignment.getTasks())
		{
			JSONObject taskObj = new JSONObject();
			taskObj.put(Task.PROPERTY_description, task.getDescription());
			taskObj.put(Task.PROPERTY_points, task.getPoints());
			// exclude verification
			tasks.put(taskObj);
		}
		obj.put(Assignment.PROPERTY_tasks, tasks);
		return obj;
	}
}
