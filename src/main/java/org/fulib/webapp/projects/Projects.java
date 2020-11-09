package org.fulib.webapp.projects;

import org.fulib.webapp.WebService;
import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.projects.model.Project;
import org.fulib.webapp.tool.Authenticator;
import org.fulib.webapp.tool.IDGenerator;
import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;
import spark.Spark;

import java.time.Instant;
import java.util.List;

public class Projects
{
	private final Mongo mongo;

	public Projects(Mongo mongo)
	{
		this.mongo = mongo;
	}

	public Object get(Request request, Response response)
	{
		if (request.contentType() == null || !request.contentType().startsWith("application/json"))
		{
			return WebService.serveIndex(request, response);
		}

		final String id = request.params("id");

		final Project project = this.getOr404(id);
		this.checkAuth(request, project);

		final JSONObject json = this.toJson(project);
		return json.toString(2);
	}

	private void checkAuth(Request request, Project project)
	{
		final String userId = Authenticator.getUserIdOr401(request);
		if (!userId.equals(project.getUserId()))
		{
			throw Spark.halt(401, "{\n  \"error\": \"token user ID does not match ID of project\"\n}\n");
		}
	}

	private Project getOr404(String id)
	{
		final Project project = this.mongo.getProject(id);
		if (project == null)
		{
			throw Spark.halt(404, String.format("{\n  \"error\": \"project with id '%s' not found\"\n}\n", id));
		}
		return project;
	}

	public Object getAll(Request request, Response response)
	{
		if (request.contentType() == null || !request.contentType().startsWith("application/json"))
		{
			return WebService.serveIndex(request, response);
		}

		final String userId = Authenticator.getAndCheckUserIdQueryParam(request);

		final List<Project> projects = this.mongo.getProjectsByUser(userId);
		final JSONArray array = new JSONArray();
		for (final Project project : projects)
		{
			array.put(toJson(project));
		}
		return array.toString(2);
	}

	private JSONObject toJson(Project project)
	{
		final JSONObject obj = new JSONObject();
		obj.put(Project.PROPERTY_ID, project.getId());
		obj.put(Project.PROPERTY_USER_ID, project.getUserId());
		obj.put(Project.PROPERTY_NAME, project.getName());
		obj.put(Project.PROPERTY_DESCRIPTION, project.getDescription());
		obj.put(Project.PROPERTY_CREATED, project.getCreated().toString());
		return obj;
	}

	public Object create(Request request, Response response)
	{
		final String id = IDGenerator.generateID();
		final Project project = this.fromJson(id, new JSONObject(request.body()));

		project.setCreated(Instant.now());

		final String userId = Authenticator.getUserIdOr401(request);
		project.setUserId(userId);

		this.mongo.saveProject(project);

		JSONObject responseJson = toJson(project);

		return responseJson.toString(2);
	}

	private Project fromJson(String id, JSONObject obj)
	{
		final Project project = new Project(id);
		project.setName(obj.getString(Project.PROPERTY_NAME));
		project.setDescription(obj.getString(Project.PROPERTY_DESCRIPTION));
		return project;
	}

	public Object update(Request request, Response response)
	{
		final String id = request.params("id");
		final Project project = this.getOr404(id);
		this.checkAuth(request, project);

		final Project newData = this.fromJson(id, new JSONObject(request.body()));

		project.setName(newData.getName());
		project.setDescription(newData.getDescription());

		this.mongo.saveProject(project);

		final JSONObject json = this.toJson(project);
		return json.toString(2);
	}
}
