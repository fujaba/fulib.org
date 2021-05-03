package org.fulib.webapp.projects;

import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveOutputStream;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.fulib.webapp.projects.docker.ContainerManager;
import org.fulib.webapp.projects.model.Container;
import org.fulib.webapp.projects.model.Project;
import org.fulib.webapp.projects.mongo.Mongo;
import org.fulib.webapp.projects.tool.Authenticator;
import org.fulib.webapp.projects.tool.IDGenerator;
import org.fulib.webapp.projects.zip.ProjectData;
import org.fulib.webapp.projects.zip.ProjectGenerator;
import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.time.Instant;
import java.util.List;
import java.util.zip.GZIPOutputStream;

import static spark.Spark.halt;

@WebSocket
public class Projects
{
	private static final String AUTH_MESSAGE = "{\n  \"error\": \"token user ID does not match ID of project\"\n}\n";

	private final Mongo mongo;
	private final ContainerManager containerManager;

	public Projects(Mongo mongo)
	{
		this.mongo = mongo;
		this.containerManager = new ContainerManager(mongo);
	}

	public Object get(Request request, Response response)
	{
		final String id = request.params("projectId");

		final Project project = getOr404(this.mongo, id);
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

	static Project getOr404(Mongo mongo, String id)
	{
		final Project project = mongo.getProject(id);
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

	public Object create(Request request, Response response) throws IOException
	{
		final String id = IDGenerator.generateID();
		final Project project = new Project(id);
		this.readJson(new JSONObject(request.body()), project);

		final Instant now = Instant.now();
		project.setCreated(now);

		final String userId = Authenticator.getUserIdOr401(request);
		project.setUserId(userId);

		this.generateProjectFiles(project);

		this.mongo.saveProject(project);

		JSONObject responseJson = toJson(project);

		return responseJson.toString(2);
	}

	private void readJson(JSONObject obj, Project project)
	{
		project.setName(obj.getString(Project.PROPERTY_NAME));
		project.setDescription(obj.getString(Project.PROPERTY_DESCRIPTION));
	}

	private void generateProjectFiles(Project project) throws IOException
	{
		final ProjectData projectData = getProjectData(project);

		try (
			final OutputStream uploadStream = this.mongo.uploadFile(project.getId());
			final GZIPOutputStream gzipOutputStream = new GZIPOutputStream(uploadStream);
			final TarArchiveOutputStream tarOutputStream = new TarArchiveOutputStream(gzipOutputStream, "UTF-8")
		)
		{
			final ByteArrayOutputStream bos = new ByteArrayOutputStream();

			new ProjectGenerator().generate(projectData, (name, output) -> {
				output.accept(bos);
				final byte[] fileData = bos.toByteArray();

				final TarArchiveEntry entry = new TarArchiveEntry(name);
				entry.setSize(fileData.length);
				entry.setModTime(project.getCreated().toEpochMilli());

				tarOutputStream.putArchiveEntry(entry);
				output.accept(tarOutputStream);
				tarOutputStream.closeArchiveEntry();

				bos.reset();
			});
		}
	}

	private ProjectData getProjectData(Project project)
	{
		final ProjectData projectData = new ProjectData();
		projectData.setPackageName("org.example");
		projectData.setScenarioFileName("Example.md");
		projectData.setScenarioText("# My First Project\n\nThere is an Example with text Hello World.\n");
		projectData.setProjectName(project.getName().replaceAll("\\W+", "-"));
		projectData.setProjectVersion("0.1.0");
		projectData.setDecoratorClassName("GenModel");
		return projectData;
	}

	public Object update(Request request, Response response)
	{
		final String id = request.params("projectId");
		final Project project = getOr404(this.mongo, id);
		checkAuth(request, project);

		this.readJson(new JSONObject(request.body()), project);

		this.mongo.saveProject(project);

		final JSONObject json = this.toJson(project);
		return json.toString(2);
	}

	public Object delete(Request request, Response response)
	{
		final String id = request.params("projectId");
		final Project project = getOr404(this.mongo, id);
		checkAuth(request, project);

		final Container container = this.containerManager.getContainer(project);
		if (container != null)
		{
			this.containerManager.stop(container);
		}

		this.mongo.deleteProject(id);
		this.mongo.deleteFile(project.getId());

		return "{}";
	}

	public Object getContainer(Request request, Response response)
	{
		final String id = request.params("projectId");
		final Project project = getOr404(this.mongo, id);
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
		final Project project = getOr404(this.mongo, id);
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
