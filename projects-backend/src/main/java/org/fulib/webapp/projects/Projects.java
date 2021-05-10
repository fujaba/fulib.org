package org.fulib.webapp.projects;

import org.fulib.webapp.projects.db.FileRepository;
import org.fulib.webapp.projects.docker.ContainerManager;
import org.fulib.webapp.projects.model.Container;
import org.fulib.webapp.projects.model.Project;
import org.fulib.webapp.projects.service.ProjectService;
import org.fulib.webapp.projects.tool.Authenticator;
import org.fulib.webapp.projects.tool.IDGenerator;
import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.time.Instant;
import java.util.List;

import static spark.Spark.halt;

public class Projects
{
	private static final String AUTH_MESSAGE = "{\n  \"error\": \"token user ID does not match ID of project\"\n}\n";

	private final ProjectService projectService;
	private final ContainerManager containerManager;

	public Projects(ProjectService projectService, FileRepository fileRepository, ContainerManager containerManager)
	{
		this.projectService = projectService;
		this.containerManager = containerManager;
	}

	public Object get(Request request, Response response)
	{
		final String id = request.params("projectId");

		final Project project = getOr404(id);
		checkAuth(request, project);

		final JSONObject json = this.toJson(project);
		return json.toString(2);
	}

	static void checkAuth(Request request, Project project)
	{
		final String userId = Authenticator.getUserIdOr401(request);
		if (!userId.equals(project.getUserId()))
		{
			throw halt(401, AUTH_MESSAGE);
		}
	}

	private Project getOr404(String id)
	{
		final Project project = this.projectService.find(id);
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

	public Object create(Request request, Response response) throws IOException
	{
		final String id = IDGenerator.generateID();
		final Project project = new Project(id);
		this.readJson(new JSONObject(request.body()), project);

		final Instant now = Instant.now();
		project.setCreated(now);

		final String userId = Authenticator.getUserIdOr401(request);
		project.setUserId(userId);

		this.projectService.create(project);

		JSONObject responseJson = toJson(project);

		return responseJson.toString(2);
	}

	private void readJson(JSONObject obj, Project project)
	{
		project.setName(obj.getString(Project.PROPERTY_NAME));
		project.setDescription(obj.getString(Project.PROPERTY_DESCRIPTION));
	}

	public Object update(Request request, Response response)
	{
		final String id = request.params("projectId");
		final Project project = getOr404(id);
		checkAuth(request, project);

		this.readJson(new JSONObject(request.body()), project);

		this.projectService.update(project);

		final JSONObject json = this.toJson(project);
		return json.toString(2);
	}

	public Object delete(Request request, Response response)
	{
		final String id = request.params("projectId");
		final Project project = getOr404(id);
		checkAuth(request, project);

		this.projectService.delete(project);

		return "{}";
	}

	public Object getContainer(Request request, Response response)
	{
		final String id = request.params("projectId");
		final Project project = getOr404(id);
		checkAuth(request, project);

		Container container = this.containerManager.getContainer(project);
		if (container == null)
		{
			container = this.containerManager.start(project);
		}

		for (int retry = 0; retry < 10; retry++)
		{
			try
			{
				final URL url = new URL(container.getUrl() + "/health");
				final HttpURLConnection connection = (HttpURLConnection) url.openConnection();
				connection.setConnectTimeout(500);
				connection.setReadTimeout(500);
				final int responseCode = connection.getResponseCode();
				if (responseCode == 200)
				{
					final JSONObject json = toJson(container);
					return json.toString(2);
				}

				// nginx is up, but project server is not ready
				Thread.sleep(500);
			}
			catch (SocketTimeoutException timeoutException)
			{
				// retry
			}
			catch (SocketException socketException)
			{
				// container is down, restart
				this.containerManager.stop(container);
				container = this.containerManager.start(project);
			}
			catch (Exception e)
			{
				e.printStackTrace();
			}
		}

		throw halt(503, "{\"error\": \"Failed to launch healthy container.\"}");
	}

	private JSONObject toJson(Container container)
	{
		final JSONObject json = new JSONObject();
		json.put(Container.PROPERTY_ID, container.getId());
		json.put(Container.PROPERTY_URL, container.getUrl());
		json.put(Container.PROPERTY_PROJECT_ID, container.getProjectId());
		return json;
	}

	public Object deleteContainer(Request request, Response response)
	{
		final String id = request.params("projectId");
		final Project project = getOr404(id);
		final Container container = this.containerManager.getContainer(project);

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

		this.containerManager.uploadFilesFromContainer(container);
		this.containerManager.stop(container);

		return "{}";
	}
}
