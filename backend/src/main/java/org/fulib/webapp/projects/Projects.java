package org.fulib.webapp.projects;

import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveOutputStream;
import org.apache.commons.io.output.WriterOutputStream;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.UpgradeRequest;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.projects.docker.ContainerManager;
import org.fulib.webapp.projects.docker.FileEventManager;
import org.fulib.webapp.projects.docker.FileWatcherProcess;
import org.fulib.webapp.projects.model.Project;
import org.fulib.webapp.projectzip.ProjectData;
import org.fulib.webapp.projectzip.ProjectGenerator;
import org.fulib.webapp.tool.Authenticator;
import org.fulib.webapp.tool.IDGenerator;
import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;
import spark.Spark;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.zip.GZIPOutputStream;

@WebSocket
public class Projects
{
	private static final String AUTH_MESSAGE = "{\n  \"error\": \"token user ID does not match ID of project\"\n}\n";

	private final Mongo mongo;

	public Projects(Mongo mongo)
	{
		this.mongo = mongo;
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
			throw Spark.halt(401, AUTH_MESSAGE);
		}
	}

	static Project getOr404(Mongo mongo, String id)
	{
		final Project project = mongo.getProject(id);
		if (project == null)
		{
			throw Spark.halt(404, notFoundMessage(id));
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
		obj.put(Project.PROPERTY_ROOT_FILE_ID, project.getRootFileId());
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

		this.mongo.deleteProject(id);
		this.mongo.deleteFile(project.getId());

		return "{}";
	}

	private final Map<Session, ContainerManager> managers = new ConcurrentHashMap<>();
	private final Map<Session, Map<String, PipedOutputStream>> inputPipes = new ConcurrentHashMap<>();

	@OnWebSocketConnect
	public void connected(Session session)
	{
		final UpgradeRequest request = session.getUpgradeRequest();
		final String requestPath = request.getRequestURI().getPath();
		if (!requestPath.startsWith("/ws/projects/"))
		{
			session.close(400, "{\"error\": \"URL path must have the format '/ws/projects/:id'\"}");
			return;
		}

		final String projectId = requestPath.substring("/ws/projects/".length());
		final Project project = this.mongo.getProject(projectId);
		if (project == null)
		{
			session.close(404, notFoundMessage(projectId));
			return;
		}

		final List<String> token = request.getParameterMap().get("token");
		if (token == null || token.isEmpty())
		{
			session.close(400, "{\"error\": \"missing token query parameter\"}");
			return;
		}

		final String authHeader = "bearer " + token.get(0);
		final String userId = Authenticator.getUserId(authHeader);
		if (!project.getUserId().equals(userId))
		{
			session.close(401, AUTH_MESSAGE);
			return;
		}

		final ContainerManager manager = new ContainerManager(this.mongo, project);
		this.managers.put(session, manager);
		manager.start();

		manager.exec(new FileWatcherProcess(manager, new FileEventManager(session)));
	}

	@OnWebSocketMessage
	public void message(Session session, String message) throws IOException
	{
		final JSONObject json = new JSONObject(message);
		final String command = json.getString("command");

		switch (command)
		{
		case "exec":
		{
			final String[] cmd = json.getJSONArray("cmd").toList().toArray(new String[0]);
			final ContainerManager manager = this.managers.get(session);

			final PipedOutputStream inputPipe = new PipedOutputStream();
			final InputStream input = new PipedInputStream(inputPipe);
			final SessionOutputWriter writer = new SessionOutputWriter(session);
			final OutputStream output = new WriterOutputStream(writer, StandardCharsets.UTF_8, 1024, true);

			final String execId = manager.exec(cmd, input, output);
			writer.execId = execId;
			this.inputPipes.computeIfAbsent(session, s -> new ConcurrentHashMap<>()).put(execId, inputPipe);

			final JSONObject processObj = new JSONObject();
			processObj.put("event", "started");
			processObj.put("process", execId);
			session.getRemote().sendString(processObj.toString());
			return;
		}
		case "input":
		{
			final String input = json.getString("text");
			final String execId = json.getString("process");
			final Map<String, PipedOutputStream> map = this.inputPipes.get(session);
			if (map != null)
			{
				final OutputStream pipedOutputStream = map.get(execId);
				if (pipedOutputStream != null)
				{
					pipedOutputStream.write(input.getBytes(StandardCharsets.UTF_8));
				}
			}
			return;
		}
		default:
			session.getRemote().sendString(new JSONObject().put("error", "invalid command: " + command).toString());
			return;
		}
	}

	@OnWebSocketClose
	public void closed(Session session, int statusCode, String reason)
	{
		this.inputPipes.remove(session);
		final ContainerManager executor = this.managers.remove(session);
		if (executor != null)
		{
			executor.stop();
		}
	}
}
