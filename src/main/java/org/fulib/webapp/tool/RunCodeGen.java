package org.fulib.webapp.tool;

import org.fulib.StrUtil;
import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.tool.model.CodeGenData;
import org.fulib.webapp.tool.model.Diagram;
import org.fulib.webapp.tool.model.Method;
import org.fulib.webapp.tool.model.Result;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.logging.Logger;

public class RunCodeGen
{
	private static final String TEMP_DIR_PREFIX = "fulibScenarios";

	public static String handle(Request req, Response res) throws Exception
	{
		final String body = req.body();
		final JSONObject jsonObject = new JSONObject(body);

		final CodeGenData input = new CodeGenData();
		input.setScenarioText(jsonObject.getString("scenarioText"));
		input.setPackageName(jsonObject.getString("packageName"));
		input.setScenarioFileName(jsonObject.getString("scenarioFileName"));

		final Result result = run(input);

		final JSONObject resultObj = toJson(result);

		res.type("application/json");

		final String resultBody = resultObj.toString(3);

		if (jsonObject.has("privacy") && "all".equals(jsonObject.get("privacy")))
		{
			Mongo.get().log(req.ip(), req.userAgent(), body, resultBody);
		}
		return resultBody;
	}

	private static JSONObject toJson(Result result)
	{
		final JSONObject resultObj = new JSONObject();

		resultObj.put(Result.PROPERTY_exitCode, result.getExitCode());
		resultObj.put(Result.PROPERTY_output, result.getOutput());

		resultObj.put(Result.PROPERTY_classDiagram, result.getClassDiagram());

		final JSONArray objectDiagramArray = new JSONArray();
		for (final Diagram diagram : result.getObjectDiagrams())
		{
			objectDiagramArray.put(toJson(diagram));
		}
		resultObj.put(Result.PROPERTY_objectDiagrams, objectDiagramArray);

		final JSONArray methodsArray = new JSONArray();
		for (final Method method : result.getMethods())
		{
			methodsArray.put(toJson(method));
		}
		resultObj.put(Result.PROPERTY_methods, methodsArray);

		return resultObj;
	}

	private static JSONObject toJson(Diagram diagram)
	{
		final JSONObject methodObj = new JSONObject();
		methodObj.put(Diagram.PROPERTY_name, diagram.getName());
		methodObj.put(Diagram.PROPERTY_content, diagram.getContent());
		return methodObj;
	}

	private static JSONObject toJson(Method method)
	{
		final JSONObject methodObj = new JSONObject();
		methodObj.put(Method.PROPERTY_className, method.getClassName());
		methodObj.put(Method.PROPERTY_name, method.getName());
		methodObj.put(Method.PROPERTY_body, method.getBody());
		return methodObj;
	}

	public static Result run(CodeGenData input) throws Exception
	{
		final Path codegendir = Files.createTempDirectory(TEMP_DIR_PREFIX);
		final Path srcDir = codegendir.resolve("src");
		final Path modelSrcDir = codegendir.resolve("model_src");
		final Path testSrcDir = codegendir.resolve("test_src");
		final Path modelClassesDir = codegendir.resolve("model_classes");
		final Path testClassesDir = codegendir.resolve("test_classes");

		try
		{
			final String bodyText = input.getScenarioText();
			final String packageName = input.getPackageName();
			final String packageDir = packageName.replace('.', '/');
			final String scenarioFileName = input.getScenarioFileName();
			final Path packagePath = srcDir.resolve(packageDir);

			// create source directory and write source scenario file
			Files.createDirectories(packagePath);
			Files.write(packagePath.resolve(scenarioFileName), bodyText.getBytes(StandardCharsets.UTF_8));

			// create output directories
			Files.createDirectories(modelSrcDir);
			Files.createDirectories(testSrcDir);

			final ByteArrayOutputStream out = new ByteArrayOutputStream();

			// invoke scenario compiler
			final int exitCode = Tools.genCompileRun(out, out, srcDir, modelSrcDir, testSrcDir, modelClassesDir,
			                                         testClassesDir, "--class-diagram-svg", "--object-diagram-svg");

			final Result result = new Result();
			result.setExitCode(exitCode);

			final String output = new String(out.toByteArray(), StandardCharsets.UTF_8);
			final String sanitizedOutput = output.replace(codegendir.toString(), ".");
			result.setOutput(sanitizedOutput);

			if (exitCode < 0) // exception occurred
			{
				Logger.getGlobal().severe(output);
			}

			if (exitCode == 0 || (exitCode & 4) != 0) // scenarioc did not fail
			{
				// collect test methods
				Files.walk(testSrcDir)
				     .filter(Tools::isJava)
				     .forEach(file -> readTestMethods(result.getMethods(), file));

				Files.walk(modelSrcDir)
				     .filter(Tools::isJava)
				     .sorted()
				     .forEach(file -> readModelMethods(result.getMethods(), file));

				// read class diagram
				final Path classDiagramFile = modelSrcDir.resolve(packageDir).resolve("classDiagram.svg");
				if (Files.exists(classDiagramFile))
				{
					final byte[] bytes = Files.readAllBytes(classDiagramFile);
					final String svgText = new String(bytes, StandardCharsets.UTF_8);
					result.setClassDiagram(svgText);
				}

				collectObjectDiagrams(result.getObjectDiagrams(), bodyText, packagePath);
			}

			return result;
		}
		finally
		{
			Tools.deleteRecursively(codegendir);
		}
	}

	// --------------- Object Diagrams ---------------

	private static void collectObjectDiagrams(List<Diagram> diagrams, String scenarioText, Path packagePath)
		throws IOException
	{
		// sorting is O(n log n) with n = number of object diagrams,
		// while a comparison takes O(m) steps to search for the occurrence in the text of length m.
		// thus, we use a cache for the index of occurrence to avoid excessive searching during sort.
		final Map<Path, Integer> diagramOccurrenceMap = new HashMap<>();

		Files.walk(packagePath).filter(file -> {
			final String fileName = file.toString();
			return fileName.endsWith(".svg") || fileName.endsWith(".png") //
			       || fileName.endsWith(".yaml") || fileName.endsWith(".html") || fileName.endsWith(".txt");
		}).sorted(Comparator.comparingInt(path -> {
			final Integer cached = diagramOccurrenceMap.get(path);
			if (cached != null)
			{
				return cached;
			}

			final String fileName = packagePath.relativize(path).toString();
			int index = scenarioText.indexOf(fileName);
			if (index < 0)
			{
				// the file generated by --object-diagram-svg is not named in the scenario text,
				// but should sort last
				index = Integer.MAX_VALUE;
			}

			diagramOccurrenceMap.put(path, index);
			return index;
		})).forEach(file -> {
			final String relativeName = packagePath.relativize(file).toString();
			diagrams.add(readObjectDiagram(file, relativeName));
		});
	}

	private static Diagram readObjectDiagram(Path file, String fileName)
	{
		final byte[] content;
		try
		{
			content = Files.readAllBytes(file);
		}
		catch (IOException e)
		{
			throw new RuntimeException(e);
		}

		final Diagram diagram = new Diagram();
		diagram.setName(fileName);

		final String fileExtension = fileName.substring(fileName.lastIndexOf('.'));
		switch (fileExtension)
		{
		case ".png":
			final String base64Content = Base64.getEncoder().encodeToString(content);
			diagram.setContent(base64Content);
			break;
		case ".yaml":
		case ".svg":
		case ".html":
		case ".txt":
			diagram.setContent(new String(content, StandardCharsets.UTF_8));
			break;
		}

		return diagram;
	}

	private static void readTestMethods(List<Method> methods, Path file)
	{
		try
		{
			tryReadTestMethods(methods, file);
		}
		catch (Exception e)
		{
			throw new RuntimeException(e);
		}
	}

	private static void tryReadTestMethods(List<Method> methods, Path file) throws IOException, JSONException
	{
		tryReadMethods(methods, file, false);
	}

	private static void readModelMethods(List<Method> methods, Path file)
	{
		try
		{
			tryReadModelMethod(methods, file);
		}
		catch (Exception e)
		{
			throw new RuntimeException(e);
		}
	}

	private static void tryReadModelMethod(List<Method> methods, Path file) throws IOException, JSONException
	{
		tryReadMethods(methods, file, true);
	}

	private static void tryReadMethods(List<Method> methods, Path file, boolean modelFilter)
		throws IOException, JSONException
	{
		final String filePath = file.toString();
		final String className = filePath.substring(filePath.lastIndexOf(File.separator) + 1,
		                                            filePath.lastIndexOf('.'));

		final Set<String> properties = modelFilter ? new HashSet<>() : null;
		final List<String> lines = Files.readAllLines(file);
		String methodName = null;
		StringBuilder methodBody = null;

		for (String line : lines)
		{
			int end;
			if (modelFilter && line.startsWith("   public static final String PROPERTY_")
			    && (end = line.lastIndexOf(" = ")) >= 0)
			{
				properties.add(line.substring("   public static final String PROPERTY_".length(), end));
			}
			if (line.startsWith("   public ") && (end = line.lastIndexOf(')')) >= 0 && line.lastIndexOf('=') <= 0)
			{
				final String decl = line.substring("   public ".length(), end + 1);
				if (!modelFilter || !shouldSkip(decl, properties))
				{
					methodName = decl;
					methodBody = new StringBuilder();
				}
			}
			else if (methodName != null && "   }".equals(line))
			{
				final Method method = new Method();
				method.setClassName(className);
				method.setName(methodName);
				method.setBody(methodBody.toString());
				methods.add(method);

				methodName = null;
				methodBody = null;
			}
			else if (methodName != null && line.startsWith("      "))
			{
				methodBody.append(line, 6, line.length()).append("\n");
			}
		}
	}

	static final Set<String> DEFAULT_METHODS = Collections.unmodifiableSet(new HashSet<>(
		Arrays.asList("firePropertyChange", "addPropertyChangeListener", "removePropertyChangeListener", "removeYou",
		              "toString")));

	// must be sorted by longest first
	static final String[] DEFAULT_PROPERTY_METHODS = { "without", "with", "get", "set" };

	static boolean shouldSkip(String decl, Set<String> properties)
	{
		final int end = decl.indexOf('(');
		final int start = decl.lastIndexOf(' ', end) + 1;
		final String methodName = decl.substring(start, end);

		if (DEFAULT_METHODS.contains(methodName))
		{
			return true;
		}

		for (final String propertyMethod : DEFAULT_PROPERTY_METHODS)
		{
			if (methodName.startsWith(propertyMethod))
			{
				final String propertyName = StrUtil.downFirstChar(methodName.substring(propertyMethod.length()));
				return properties.contains(propertyName);
			}
		}

		return false;
	}
}
