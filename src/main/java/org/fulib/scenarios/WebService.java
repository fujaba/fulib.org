package org.fulib.scenarios;

import org.fulib.scenarios.tool.Tools;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import spark.Request;
import spark.Response;
import spark.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.List;
import java.util.logging.Logger;

public class WebService
{
	private static final String TEMP_DIR_PREFIX    = "fulibScenarios";
	private static final String PACKAGE_NAME       = "webapp";
	private static final String SCENARIO_FILE_NAME = "scenario.md";

	public static void main(String[] args)
	{
		final Service service = Service.ignite();

		service.port(4567);
		service.staticFiles.location("webapp");

		service.get("/github", (req, res) -> {
			res.redirect("https://github.com/fujaba/fulib");
			return res;
		});

		service.post("/runcodegen", WebService::runCodeGen);

		Logger.getGlobal().info("scenario server started ... ");

		// http://localhost:4567
	}

	private static String runCodeGen(Request req, Response res) throws Exception
	{
		final Path codegendir = Files.createTempDirectory(TEMP_DIR_PREFIX);
		final Path srcDir = codegendir.resolve("src");
		final Path mainPackageDir = srcDir.resolve(PACKAGE_NAME);
		final Path modelSrcDir = codegendir.resolve("model_src");
		final Path testSrcDir = codegendir.resolve("test_src");
		final Path scenarioFile = mainPackageDir.resolve(SCENARIO_FILE_NAME);
		final Path modelClassesDir = codegendir.resolve("model_classes");
		final Path testClassesDir = codegendir.resolve("test_classes");

		try
		{
			final String body = req.body();
			final JSONObject jsonObject = new JSONObject(body);
			final String bodyText = jsonObject.getString("scenarioText");

			// create source directory and write source scenario file
			Files.createDirectories(srcDir);
			Files.createDirectories(mainPackageDir);
			Files.write(scenarioFile, bodyText.getBytes(StandardCharsets.UTF_8));

			// create output directories
			Files.createDirectories(modelSrcDir);
			Files.createDirectories(testSrcDir);

			final ByteArrayOutputStream out = new ByteArrayOutputStream();

			// invoke scenario compiler
			final int exitCode = Tools.genCompileRun(out, out, srcDir, modelSrcDir, testSrcDir, modelClassesDir,
																  testClassesDir, "--class-diagram-svg", "--object-diagram-svg");

			final JSONObject result = new JSONObject();

			result.put("exitCode", exitCode);

			final String output = new String(out.toByteArray(), StandardCharsets.UTF_8);
			result.put("output", output.replace(codegendir.toString(), "."));

			if (exitCode < 0) // exception occurred
			{
				Logger.getGlobal().severe(output);
			}

			if (exitCode == 0 || (exitCode & 4) != 0) // scenarioc did not fail
			{
				// collect test methods
				final JSONArray methodArray = new JSONArray();

				Files.walk(testSrcDir).filter(Tools::isJava).forEach(file -> readTestMethod(methodArray, file));

				result.put("testMethods", methodArray);

				// read class diagram
				final Path classDiagramFile = modelSrcDir.resolve(PACKAGE_NAME).resolve("classDiagram.svg");
				if (Files.exists(classDiagramFile))
				{
					final byte[] bytes = Files.readAllBytes(classDiagramFile);
					final String svgText = new String(bytes, StandardCharsets.UTF_8);
					result.put("classDiagram", svgText);
				}

				// read object diagrams
				final JSONArray objectDiagrams = new JSONArray();
				Path srcPackage = srcDir.resolve(PACKAGE_NAME);
				Files.walk(srcPackage).filter(file -> {
					final String fileName = file.toString();
					return fileName.endsWith(".svg") || fileName.endsWith(".yaml") || fileName.endsWith(".png");
				}).forEach(file -> addObjectDiagram(objectDiagrams, file, srcPackage.relativize(file).toString()));
				result.put("objectDiagrams", objectDiagrams);
			}

			res.type("application/json");
			return result.toString(3);
		}
		finally
		{
			Tools.deleteRecursively(codegendir);
		}
	}

	private static void addObjectDiagram(JSONArray objectDiagrams, Path file, String fileName)
	{
		try
		{
			tryAddObjectDiagram(objectDiagrams, file, fileName);
		}
		catch (Exception e)
		{
			throw new RuntimeException(e);
		}
	}

	private static void tryAddObjectDiagram(JSONArray objectDiagrams, Path file, String fileName)
		throws JSONException, IOException
	{
		final byte[] content = Files.readAllBytes(file);

		final JSONObject object = new JSONObject();
		object.put("name", fileName);

		switch (fileName.substring(fileName.indexOf('.')))
		{
		case ".png":
			final String base64Content = Base64.getEncoder().encodeToString(content);
			object.put("content", base64Content);
			break;
		case ".yaml":
		case ".svg":
			object.put("content", new String(content, StandardCharsets.UTF_8));
			break;
		}

		objectDiagrams.put(object);
	}

	private static void readTestMethod(JSONArray methodArray, Path file)
	{
		try
		{
			tryReadTestMethod(methodArray, file);
		}
		catch (Exception e)
		{
			throw new RuntimeException(e);
		}
	}

	private static void tryReadTestMethod(JSONArray methodArray, Path file) throws IOException, JSONException
	{
		final List<String> lines = Files.readAllLines(file);
		String methodName = null;
		StringBuilder methodBody = null;

		for (String line : lines)
		{
			final int end;
			if (line.startsWith("   public ") && (end = line.indexOf(')')) >= 0)
			{
				methodName = line.substring("   public ".length(), end + 1);
				methodBody = new StringBuilder();
			}
			else if (methodName != null && "   }".equals(line))
			{
				final JSONObject method = new JSONObject();
				method.put("name", methodName);
				method.put("body", methodBody.toString());
				methodArray.put(method);

				methodName = null;
				methodBody = null;
			}
			else if (methodName != null && line.startsWith("      "))
			{
				methodBody.append(line, 6, line.length()).append("\n");
			}
		}
	}
}
