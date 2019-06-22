package org.fulib.scenarios.tool;

import org.json.JSONException;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class ProjectZip
{
	private static String[] staticFiles = {
		// config
		"build.gradle", "settings.gradle",
		// scripts
		"gradlew", "gradlew.bat",
		// wrapper
		"gradle/wrapper/gradle-wrapper.jar", "gradle/wrapper/gradle-wrapper.properties",
		//
	};

	public static Object handle(Request request, Response response) throws IOException, JSONException
	{
		final String body = request.body();
		final JSONObject jsonObject = new JSONObject(body);
		final String bodyText = jsonObject.getString("scenarioText");

		response.type("application/zip");
		try (ZipOutputStream zip = new ZipOutputStream(response.raw().getOutputStream()))
		{
			final byte[] buffer = new byte[8192];

			for (final String file : staticFiles)
			{
				zip.putNextEntry(new ZipEntry(file));
				try (InputStream fileInput = ProjectZip.class.getResourceAsStream("/projectzip/" + file))
				{
					copy(buffer, fileInput, zip);
				}
			}

			zip.putNextEntry(new ZipEntry("src/main/scenarios/webapp/scenario.md"));
			zip.write(bodyText.getBytes(StandardCharsets.UTF_8));
		}

		return response.raw();
	}

	private static void copy(byte[] buffer, InputStream from, OutputStream to) throws IOException
	{
		int read;
		while ((read = from.read(buffer)) > 0)
		{
			to.write(buffer, 0, read);
		}
	}
}
