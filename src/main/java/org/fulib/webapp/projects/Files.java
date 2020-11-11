package org.fulib.webapp.projects;

import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.projects.model.File;
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

public class Files
{
	private final Mongo mongo;

	public Files(Mongo mongo)
	{
		this.mongo = mongo;
	}

	public Object get(Request request, Response response)
	{
		final String id = request.params("fileId");
		final File file = getOr404(this.mongo, id);
		checkAuth(request, file);
		final JSONObject json = this.toJson(file);
		return json.toString(2);
	}

	static File getOr404(Mongo mongo, String id)
	{
		final File file = mongo.getFile(id);
		if (file == null)
		{
			throw Spark.halt(404, String.format("{\n  \"error\": \"file with id '%s' not found\"\n}\n", id));
		}
		return file;
	}

	static void checkAuth(Request request, File file)
	{
		final String userId = Authenticator.getUserIdOr401(request);
		if (!userId.equals(file.getUserId()))
		{
			throw Spark.halt(401, "{\n  \"error\": \"token user ID does not match ID of file\"\n}\n");
		}
	}

	private JSONObject toJson(File file)
	{
		final JSONObject obj = new JSONObject();
		obj.put(File.PROPERTY_ID, file.getId());
		obj.put(File.PROPERTY_USER_ID, file.getUserId());
		obj.put(File.PROPERTY_PROJECT_ID, file.getProjectId());
		obj.put(File.PROPERTY_PARENT_ID, file.getParentId());
		obj.put(File.PROPERTY_NAME, file.getName());
		obj.put(File.PROPERTY_CREATED, file.getCreated());
		obj.put(File.PROPERTY_MODIFIED, file.getModified());
		return obj;
	}

	public Object getChildren(Request request, Response response)
	{
		final String parentId = request.queryParams("parentId");
		final File parent = getOr404(this.mongo, parentId);
		checkAuth(request, parent);

		final List<File> children = this.mongo.getFilesByParent(parentId);
		final JSONArray array = new JSONArray();
		for (final File child : children)
		{
			array.put(toJson(child));
		}
		return array.toString(2);
	}

	public Object create(Request request, Response response)
	{
		final String projectId = request.params("projectId");
		final Project project = Projects.getOr404(this.mongo, projectId);
		Projects.checkAuth(request, project);

		final String id = IDGenerator.generateID();
		final File file = new File(id);
		readJson(new JSONObject(request.body()), file);

		file.setCreated(Instant.now());
		file.setProjectId(projectId);
		file.setUserId(project.getUserId());

		this.mongo.saveFile(file);

		final JSONObject json = this.toJson(file);
		return json.toString(2);
	}

	private void readJson(JSONObject obj, File file)
	{
		file.setName(obj.getString(File.PROPERTY_NAME));
		file.setParentId(obj.getString(File.PROPERTY_PARENT_ID));
	}

	public Object update(Request request, Response response)
	{
		final String id = request.params("fileId");
		final File file = getOr404(this.mongo, id);
		checkAuth(request, file);

		readJson(new JSONObject(request.body()), file);

		this.mongo.saveFile(file);

		final JSONObject json = toJson(file);
		return json.toString(2);
	}

	public Object delete(Request request, Response response)
	{
		final String id = request.params("fileId");
		final File file = getOr404(this.mongo, id);
		checkAuth(request, file);

		// TODO delete children
		this.mongo.deleteFile(id);

		return "{}";
	}
}
