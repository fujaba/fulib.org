package org.fulib.webapp.projects.containers;

import org.fulib.webapp.projects.projects.Project;
import org.fulib.webapp.projects.projects.ProjectService;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import javax.inject.Inject;
import java.time.Instant;
import java.util.concurrent.TimeoutException;

import static org.fulib.webapp.projects.projects.ProjectController.checkAuth;
import static org.fulib.webapp.projects.projects.ProjectController.getOr404;
import static spark.Spark.halt;

public class ContainerController
{
	@Inject
	ProjectService projectService;
	@Inject
	ContainerService containerService;

	@Inject
	public ContainerController()
	{
	}

	public Object get(Request request, Response response)
	{
		final String id = request.params("projectId");
		final Project project = getOr404(projectService, id);
		checkAuth(request, project);

		final Container container = this.containerService.find(id);
		if (container == null)
		{
			throw halt(404, new JSONObject()
				.put("error", "no container for project with id '" + id + "' + is active")
				.toString());
		}

		final JSONObject containerJson = toJson(container);
		return containerJson.toString();
	}

	public Object create(Request request, Response response)
	{
		final String id = request.params("projectId");
		final Project project;
		if (id == null)
		{
			project = parseLocalProject(new JSONObject(request.body()));
		}
		else
		{
			project = getOr404(projectService, id);
			checkAuth(request, project);
		}

		try
		{
			final Container container = this.containerService.create(project);
			final JSONObject containerJson = toJson(container);
			return containerJson.toString();
		}
		catch (TimeoutException e)
		{
			throw halt(503, new JSONObject().put("error", e.getMessage()).toString());
		}
	}

	private Project parseLocalProject(JSONObject jsonObject)
	{
		final Project project = new Project();
		project.setLocal(true);
		project.setId(jsonObject.getString(Project.PROPERTY_ID));
		project.setName(jsonObject.getString(Project.PROPERTY_NAME));
		project.setDescription(jsonObject.getString(Project.PROPERTY_DESCRIPTION));
		project.setCreated(Instant.parse(jsonObject.getString(Project.PROPERTY_CREATED)));
		return project;
	}

	public Object delete(Request request, Response response)
	{
		final String id = request.params("projectId");
		// could be null in case of a local project
		final Project project = projectService.find(id);
		if (project != null)
		{
			checkAuth(request, project);
		}

		final Container container = this.containerService.find(id);

		if (container == null)
		{
			throw halt(404, String.format("{\"error\": \"container or project with id '%s' not found\"}\n", id));
		}

		this.containerService.stop(container);

		return "{}";
	}

	private JSONObject toJson(Container container)
	{
		final JSONObject json = new JSONObject();
		json.put(Container.PROPERTY_ID, container.getId());
		json.put(Container.PROPERTY_URL, container.getUrl());
		json.put(Container.PROPERTY_PROJECT_ID, container.getProjectId());
		return json;
	}
}
