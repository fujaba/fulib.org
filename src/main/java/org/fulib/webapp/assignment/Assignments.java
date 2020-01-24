package org.fulib.webapp.assignment;

import org.fulib.webapp.assignment.model.Assignment;
import org.fulib.webapp.assignment.model.Task;
import org.fulib.webapp.mongo.Mongo;
import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import java.time.Instant;

public class Assignments
{
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
		final String id = request.params("id");

		if (request.contentType() == null || !request.contentType().startsWith("application/json"))
		{
			response.redirect("/assignment/view.html?id=" + id);
			return "";
		}

		Assignment assignment = Mongo.get().getAssignment(id);
		if (assignment == null)
		{
			response.status(404);
			return "{}";
		}

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
