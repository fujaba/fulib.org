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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.Request;
import spark.Response;

import javax.inject.Inject;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RunCodeGen
{
	// =============== Constants ===============

	private static final Logger LOGGER = LoggerFactory.getLogger(RunCodeGen.class);

	private static final Pattern PROPERTY_CONSTANT_PATTERN = Pattern.compile("^\\s*public static final String PROPERTY_\\w+ = \"(\\w+)\";$");

	// =============== Fields ===============

	private final Mongo db;
	private final String tempDir = System.getProperty("java.io.tmpdir") + "/fulib.org/";
	private final ScheduledExecutorService deleter = Executors.newScheduledThreadPool(1);

	// =============== Constructors ===============

	@Inject
	public RunCodeGen(Mongo db)
	{
		this.db = db;
	}

	// =============== Methods ===============

	public String getTempDir()
	{
		return this.tempDir;
	}

	public String handle(Request req, Response res) throws Exception
	{
		final String body = req.body();
		final JSONObject jsonObject = new JSONObject(body);

		final CodeGenData input = fromJson(jsonObject);

		final Result result = run(input);

		final JSONObject resultObj = toJson(result);

		res.type("application/json");

		final String resultBody = resultObj.toString(3);

		if (jsonObject.has("privacy") && "all".equals(jsonObject.get("privacy")))
		{
			this.db.log(req.ip(), req.userAgent(), body, resultBody);
		}
		return resultBody;
	}

	// =============== Static Methods ===============

	private static CodeGenData fromJson(JSONObject obj)
	{
		final CodeGenData input = new CodeGenData();
		input.setScenarioText(obj.getString("scenarioText"));
		input.setPackageName(obj.getString("packageName"));
		input.setScenarioFileName(obj.getString("scenarioFileName"));
		return input;
	}

	private static JSONObject toJson(Result result)
	{
		final JSONObject resultObj = new JSONObject();

		resultObj.put(Result.PROPERTY_id, result.getId());
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
		methodObj.put(Diagram.PROPERTY_path, diagram.getPath());
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

	public Result run(CodeGenData input) throws Exception
	{
		final String id = UUID.randomUUID().toString();
		final Path tempDir = Paths.get(this.getTempDir());
		final Path projectDir = tempDir.resolve("api").resolve("runcodegen").resolve(id);
		final Path srcDir = projectDir.resolve("src");
		final Path modelSrcDir = projectDir.resolve("model_src");
		final Path testSrcDir = projectDir.resolve("test_src");
		final Path modelClassesDir = projectDir.resolve("model_classes");
		final Path testClassesDir = projectDir.resolve("test_classes");

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
			                                         testClassesDir, "--class-diagram-svg", "--object-diagram-svg",
			                                         "--marker-end-columns");

			final Result result = new Result(id);
			result.setExitCode(exitCode);

			final String output = new String(out.toByteArray(), StandardCharsets.UTF_8);
			final String sanitizedOutput = output.replace(projectDir.toString(), ".");
			result.setOutput(sanitizedOutput);

			if (exitCode < 0) // exception occurred
			{
				LOGGER.error(output);
			}

			if (exitCode == 0 || (exitCode & 4) != 0) // scenarioc did not fail
			{
				collectTestMethods(modelSrcDir, testSrcDir, result.getMethods());

				// read class diagram
				final Path classDiagramFile = modelSrcDir.resolve(packageDir).resolve("classDiagram.svg");
				if (Files.exists(classDiagramFile))
				{
					final byte[] bytes = Files.readAllBytes(classDiagramFile);
					final String svgText = new String(bytes, StandardCharsets.UTF_8);
					result.setClassDiagram(svgText);
				}

				collectObjectDiagrams(result.getObjectDiagrams(), bodyText, projectDir, packagePath);
			}

			return result;
		}
		finally
		{
			this.deleter.schedule(() -> Tools.deleteRecursively(projectDir), 1, TimeUnit.HOURS);
		}
	}

	// --------------- Object Diagrams ---------------

	private static void collectObjectDiagrams(List<Diagram> diagrams, String scenarioText, Path projectDir,
		Path packageDir) throws IOException
	{
		// sorting is O(n log n) with n = number of object diagrams,
		// while a comparison takes O(m) steps to search for the occurrence in the text of length m.
		// thus, we use a cache for the index of occurrence to avoid excessive searching during sort.
		final Map<Path, Integer> diagramOccurrenceMap = new HashMap<>();

		Files.walk(packageDir).filter(file -> {
			final String fileName = file.toString();
			return fileName.endsWith(".svg") || fileName.endsWith(".png") //
			       || fileName.endsWith(".yaml") || fileName.endsWith(".html") || fileName.endsWith(".txt");
		}).sorted(Comparator.comparingInt(path -> {
			final Integer cached = diagramOccurrenceMap.get(path);
			if (cached != null)
			{
				return cached;
			}

			final String fileName = packageDir.relativize(path).toString();
			int index = scenarioText.indexOf(fileName);
			if (index < 0)
			{
				// the file generated by --object-diagram-svg is not named in the scenario text,
				// but should sort last
				index = Integer.MAX_VALUE;
			}

			diagramOccurrenceMap.put(path, index);
			return index;
		})).forEach(file -> diagrams.add(readObjectDiagram(file, projectDir, packageDir)));
	}

	private static Diagram readObjectDiagram(Path file, Path projectDir, Path packageDir)
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

		final String fileName = packageDir.relativize(file).toString();
		final String path = projectDir.relativize(file).toString();

		final Diagram diagram = new Diagram();
		diagram.setName(fileName);
		diagram.setPath(path);

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

	// --------------- Methods ---------------

	private static void collectTestMethods(Path modelSrcDir, Path testSrcDir, List<Method> methods) throws IOException
	{
		Files.walk(testSrcDir).filter(Tools::isJava).forEach(file -> tryReadMethods(methods, file, false));
		Files.walk(modelSrcDir).filter(Tools::isJava).sorted().forEach(file -> tryReadMethods(methods, file, true));
	}

	private static void tryReadMethods(List<Method> methods, Path file, boolean modelFilter)
	{
		try
		{
			readMethods(methods, file, modelFilter);
		}
		catch (Exception e)
		{
			throw new RuntimeException(e);
		}
	}

	private static void readMethods(List<Method> methods, Path file, boolean modelFilter)
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
			Matcher matcher;
			if (modelFilter && (matcher = PROPERTY_CONSTANT_PATTERN.matcher(line)).find())
			{
				properties.add(matcher.group(1));
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
		Arrays.asList("firePropertyChange", "addPropertyChangeListener", "removePropertyChangeListener", "listeners", "removeYou",
		              "toString")));

	// must be sorted by longest first
	static final String[] DEFAULT_PROPERTY_METHODS = { "without", "with", "get", "set", "is" };

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
