package org.fulib.webapp.projects.controller;

import org.fulib.webapp.projects.model.Container;
import org.fulib.webapp.projects.model.Project;
import org.fulib.webapp.projects.service.ContainerService;
import org.fulib.webapp.projects.service.ProjectService;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import java.util.concurrent.TimeoutException;

import static org.fulib.webapp.projects.controller.ProjectController.checkAuth;
import static org.fulib.webapp.projects.controller.ProjectController.getOr404;
import static spark.Spark.halt;

public class ContainerController
{
	private final ProjectService projectService;
	private final ContainerService containerService;

	public ContainerController(ProjectService projectService, ContainerService containerService)
	{
		this.projectService = projectService;
		this.containerService = containerService;
	}

	public Object get(Request request, Response response)
	{
		final String id = request.params("projectId");
		final Project project = getOr404(projectService, id);
		checkAuth(request, project);

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

	private JSONObject toJson(Container container)
	{
		final JSONObject json = new JSONObject();
		json.put(Container.PROPERTY_ID, container.getId());
		json.put(Container.PROPERTY_URL, container.getUrl());
		json.put(Container.PROPERTY_PROJECT_ID, container.getProjectId());
		return json;
	}

	public Object delete(Request request, Response response)
	{
		final String id = request.params("projectId");
		final Project project = getOr404(projectService, id);
		final Container container = this.containerService.find(project);

		if (container == null)
		{
			throw halt(404, String.format("{\"error\": \"container for project with id '%s' not found\"}\n", id));
		}

		final String stopToken = request.queryParams("stopToken");
		if (stopToken == null)
		{
			checkAuth(request, project);
		}
		else if (!stopToken.equals(container.getStopToken()))
		{
			throw halt(401, "{\"error\": \"invalid stopToken\"}\n");
		}

		this.containerService.stop(container);

		return "{}";
	}
}
