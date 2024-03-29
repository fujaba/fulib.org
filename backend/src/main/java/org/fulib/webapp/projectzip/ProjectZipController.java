package org.fulib.webapp.projectzip;

import org.json.JSONException;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import javax.inject.Inject;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class ProjectZipController
{
	private final ProjectGenerator projectGenerator;

	@Inject
	public ProjectZipController(ProjectGenerator projectGenerator)
	{
		this.projectGenerator = projectGenerator;
	}

	public Object handle(Request request, Response response) throws IOException, JSONException
	{
		final String body = request.body();
		final JSONObject jsonObject = new JSONObject(body);
		final ProjectData projectData = readJson(jsonObject);

		response.type("application/zip");
		try (final ZipOutputStream zip = new ZipOutputStream(response.raw().getOutputStream()))
		{
			this.projectGenerator.generate(projectData, (name, output) -> {
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
		projectData.setScenarioText(json.optString(ProjectData.PROPERTY_SCENARIO_TEXT));
		projectData.setDecoratorClassName(json.optString(ProjectData.PROPERTY_DECORATOR_CLASS_NAME, null));
		return projectData;
	}
}
