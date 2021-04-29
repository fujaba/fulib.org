package org.fulib.webapp.projects.zip;

import org.json.JSONException;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class ProjectZip
{
	public Object handle(Request request, Response response) throws IOException, JSONException
	{
		final String body = request.body();
		final JSONObject jsonObject = new JSONObject(body);
		final ProjectData projectData = readJson(jsonObject);

		response.type("application/zip");
		try (final ZipOutputStream zip = new ZipOutputStream(response.raw().getOutputStream()))
		{
			new ProjectGenerator().generate(projectData, (name, output) -> {
				zip.putNextEntry(new ZipEntry(name));
				output.accept(zip);
			});
		}

		return response.raw();
	}

	private static ProjectData readJson(JSONObject json)
	{
		final ProjectData projectData = new ProjectData();
		projectData.setPackageName(json.getString(ProjectData.PROPERTY_PACKAGE_NAME));
		projectData.setScenarioFileName(json.getString(ProjectData.PROPERTY_SCENARIO_FILE_NAME));
		projectData.setProjectName(json.getString(ProjectData.PROPERTY_PROJECT_NAME));
		projectData.setProjectVersion(json.getString(ProjectData.PROPERTY_PROJECT_VERSION));
		projectData.setScenarioText(json.getString(ProjectData.PROPERTY_SCENARIO_TEXT));
		projectData.setDecoratorClassName(json.optString(ProjectData.PROPERTY_DECORATOR_CLASS_NAME, null));
		return projectData;
	}
}
