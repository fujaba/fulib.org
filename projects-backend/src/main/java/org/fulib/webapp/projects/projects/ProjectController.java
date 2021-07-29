package org.fulib.webapp.projects.projects;

import org.eclipse.jetty.http.HttpStatus;
import org.fulib.webapp.projects.auth.Authenticator;
import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import javax.inject.Inject;
import java.io.IOException;
import java.time.Instant;
import java.util.List;

import static spark.Spark.halt;

public class ProjectController
{
	@Inject
	ProjectService projectService;

	@Inject
	public ProjectController()
	{
	}

	public void checkAuth(Request request, Project project)
	{
		final String userId = Authenticator.getUserIdOr401(request);
		if (!projectService.isAuthorized(project.getId(), userId))
		{
			// language=JSON
			throw halt(HttpStatus.FORBIDDEN_403,
			           "{\n" + "  \"error\": \"You do not have access to this project\"\n" + "}\n");
		}
	}

	public void checkOwner(Request request, Project project)
	{
		final String userId = Authenticator.getUserIdOr401(request);
		if (!userId.equals(project.getUserId()))
		{
			// language=JSON
			throw halt(HttpStatus.FORBIDDEN_403,
			           "{\n" + "  \"error\": \"You are not the owner of this project\"\n" + "}\n");
		}
	}

	public Project getOr404(String id)
	{
		final Project project = projectService.find(id);
		if (project == null)
		{
			throw halt(404, notFoundMessage(id));
		}
		return project;
	}

	private static String notFoundMessage(String id)
	{
		return String.format("{\n  \"error\": \"project with id '%s' not found\"\n}\n", id);
	}

	public Object get(Request request, Response response)
	{
		final String id = request.params("projectId");

		final Project project = getOr404(id);
		checkAuth(request, project);

		final JSONObject json = this.toJson(project);
		return json.toString(2);
	}

	public Object getAll(Request request, Response response)
	{
		final String userId = Authenticator.getAndCheckUserIdQueryParam(request);

		final List<Project> projects = this.projectService.findByUser(userId);
		final JSONArray array = new JSONArray();
		for (final Project project : projects)
		{
			array.put(toJson(project));
		}
		return array.toString(2);
	}

	public Object create(Request request, Response response) throws IOException
	{
		final Project project = new Project();
		this.readJson(new JSONObject(request.body()), project);

		final Instant now = Instant.now();
		project.setCreated(now);

		final String userId = Authenticator.getUserIdOr401(request);
		project.setUserId(userId);

		this.projectService.create(project);

		JSONObject responseJson = toJson(project);

		return responseJson.toString(2);
	}

	public Object update(Request request, Response response)
	{
		final String id = request.params("projectId");
		final Project project = getOr404(id);
		checkAuth(request, project);

		final JSONObject body = new JSONObject(request.body());
		if (body.has(Project.PROPERTY_USER_ID))
		{
			checkOwner(request, project);
		}

		this.readJson(body, project);

		this.projectService.update(project);

		final JSONObject json = this.toJson(project);
		return json.toString(2);
	}

	public Object delete(Request request, Response response)
	{
		final String id = request.params("projectId");
		final Project project = getOr404(id);
		checkOwner(request, project);

		this.projectService.delete(project);

		return "{}";
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

	private void readJson(JSONObject obj, Project project)
	{
		if (obj.has(Project.PROPERTY_NAME))
		{
			project.setName(obj.getString(Project.PROPERTY_NAME));
		}
		if (obj.has(Project.PROPERTY_DESCRIPTION))
		{
			project.setDescription(obj.getString(Project.PROPERTY_DESCRIPTION));
		}
		if (obj.has(Project.PROPERTY_USER_ID))
		{
			project.setUserId(obj.getString(Project.PROPERTY_USER_ID));
		}
	}
}
