package org.fulib.webapp.projectzip;

import org.apache.commons.io.IOUtils;
import org.fulib.webapp.mongo.Mongo;
import org.json.JSONException;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class ProjectZip
{
	public static Object handle(Request request, Response response) throws IOException, JSONException
	{
		final String body = request.body();
		final JSONObject jsonObject = new JSONObject(body);
		final String packageName = jsonObject.getString("packageName");
		final String fileName = jsonObject.getString("scenarioFileName");
		final String projectName = jsonObject.getString("projectName");
		final String projectVersion = jsonObject.getString("projectVersion");
		final String bodyText = jsonObject.getString("scenarioText");

		response.type("application/zip");
		try (final ZipOutputStream zip = new ZipOutputStream(response.raw().getOutputStream()))
		{
			final byte[] buffer = new byte[8192];

			zip.putNextEntry(new ZipEntry("src/main/scenarios/" + packageName.replace('.', '/') + "/" + fileName));
			zip.write(bodyText.getBytes(StandardCharsets.UTF_8));

			copy("gradlew", "gradlew", zip, buffer);
			copy("gradlew.bat", "gradlew.bat", zip, buffer);
			copy("gradle/wrapper/gradle-wrapper.jar.zip", "gradle/wrapper/gradle-wrapper.jar", zip, buffer);
			copy("gradle/wrapper/gradle-wrapper.properties", "gradle/wrapper/gradle-wrapper.properties", zip, buffer);

			zip.putNextEntry(new ZipEntry("settings.gradle"));
			try (final InputStream input = ProjectZip.class.getResourceAsStream("settings.gradle"))
			{
				final String content = IOUtils.toString(input, StandardCharsets.UTF_8);
				final String result = content.replace("$$projectName$$", projectName);
				IOUtils.write(result, zip, StandardCharsets.UTF_8);
			}

			zip.putNextEntry(new ZipEntry("build.gradle"));
			try (final InputStream input = ProjectZip.class.getResourceAsStream("build.gradle"))
			{
				final String content = IOUtils.toString(input, StandardCharsets.UTF_8);
				final String result = content.replace("$$packageName$$", packageName)
				                             .replace("$$projectVersion$$", projectVersion);
				IOUtils.write(result, zip, StandardCharsets.UTF_8);
			}
		}

		if (jsonObject.has("privacy") && "all".equals(jsonObject.get("privacy")))
		{
			Mongo.get().log(request.ip(), request.userAgent(), body, "{}");
		}

		return response.raw();
	}

	private static void copy(String resourceName, String file, ZipOutputStream zip, byte[] buffer) throws IOException
	{
		zip.putNextEntry(new ZipEntry(file));
		try (final InputStream fileInput = ProjectZip.class.getResourceAsStream(resourceName))
		{
			IOUtils.copyLarge(fileInput, zip, buffer);
		}
	}
}
