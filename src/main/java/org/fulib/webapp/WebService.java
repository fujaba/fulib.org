package org.fulib.webapp;

import org.fulib.webapp.assignment.Assignments;
import org.fulib.webapp.assignment.Comments;
import org.fulib.webapp.assignment.Courses;
import org.fulib.webapp.assignment.Solutions;
import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.projectzip.ProjectZip;
import org.fulib.webapp.tool.MarkdownUtil;
import org.fulib.webapp.tool.RunCodeGen;
import spark.Request;
import spark.Response;
import spark.Service;

import java.io.File;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

public class WebService
{
	public static final String VERSION;
	public static final String FULIB_SCENARIOS_VERSION;
	public static final String FULIB_MOCKUPS_VERSION;

	static
	{
		final Properties props = new Properties();
		try
		{
			props.load(WebService.class.getResourceAsStream("version.properties"));
		}
		catch (Exception e)
		{
			Logger.getGlobal().throwing("WebService", "static init", e);
		}

		VERSION = props.getProperty("webapp.version");
		FULIB_SCENARIOS_VERSION = props.getProperty("fulibScenarios.version");
		FULIB_MOCKUPS_VERSION = props.getProperty("fulibMockups.version");
	}

	private Service service;
	private Mongo db;
	private RunCodeGen runCodeGen;
	private ProjectZip projectZip;
	private Assignments assignments;
	private Comments comments;
	private Solutions solutions;
	private Courses courses;

	public static void main(String[] args)
	{
		new WebService().start();
	}

	public void start()
	{
		service = Service.ignite();
		service.port(4567);

		service.staticFiles.location("/org/fulib/webapp/static");

		if (isDevEnv())
		{
			enableCORS();
		}

		setupRedirects();

		initComponents();

		addMainRoutes();
		addAssignmentsRoutes();
		addCoursesRoutes();
		addUtilRoutes();

		service.notFound(WebService::serveIndex);

		setupExceptionHandler();

		Logger.getGlobal().info("scenario server started on http://localhost:4567");
	}

	private boolean isDevEnv()
	{
		return new File("build.gradle").exists();
	}

	private void setupRedirects()
	{
		service.redirect.get("/github", "https://github.com/fujaba/fulib.org");
	}

	private void addMainRoutes()
	{
		service.post("/runcodegen", runCodeGen::handle);
		service.post("/projectzip", projectZip::handle);
	}

	private void addUtilRoutes()
	{
		service.post("/rendermarkdown", (request, response) -> {
			response.type("text/html");
			return MarkdownUtil.renderHtml(request.body());
		});
	}

	private void addCoursesRoutes()
	{
		service.path("/courses", () -> {
			service.post("", courses::create);
			service.get("/:courseID", courses::get);
		});
	}

	private void setupExceptionHandler()
	{
		service.exception(Exception.class, (exception, request, response) -> {
			Logger.getGlobal().log(Level.SEVERE, "unhandled exception processing request", exception);
		});
	}

	private void initComponents()
	{
		db = Mongo.get();
		runCodeGen = new RunCodeGen(db);
		projectZip = new ProjectZip(db);
		assignments = new Assignments(db);
		comments = new Comments(db);
		solutions = new Solutions(db);
		courses = new Courses(db);
	}

	private void addAssignmentsRoutes()
	{
		service.path("/assignments", () -> {
			service.post("", assignments::create);

			service.post("/create/check", solutions::check);

			service.path("/:assignmentID", this::addAssignmentRoutes);
		});
	}

	private void addAssignmentRoutes()
	{
		service.get("", assignments::get);

		service.post("/check", solutions::check);

		addSolutionsRoutes();
	}

	private void addSolutionsRoutes()
	{
		service.path("/solutions", () -> {
			service.post("", solutions::create);
			service.get("", solutions::getAll);

			service.path("/:solutionID", this::addSolutionRoutes);
		});
	}

	private void addSolutionRoutes()
	{
		service.get("", solutions::get);

		service.path("/assignee", () -> {
			service.get("", solutions::getAssignee);
			service.put("", solutions::setAssignee);
		});

		service.path("/gradings", () -> {
			service.post("", solutions::postGrading);
			service.get("", solutions::getGradings);
		});

		service.path("/comments", () -> {
			service.post("", comments::post);
			service.get("", comments::getChildren);
		});
	}

	private void enableCORS()
	{
		service.staticFiles.header("Access-Control-Allow-Origin", "*");

		service.before((request, response) -> response.header("Access-Control-Allow-Origin", "*"));

		service.options("/*", (req, res) -> {
			String accessControlRequestHeaders = req.headers("Access-Control-Request-Headers");
			if (accessControlRequestHeaders != null)
			{
				res.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
			}

			String accessControlRequestMethod = req.headers("Access-Control-Request-Method");
			if (accessControlRequestMethod != null)
			{
				res.header("Access-Control-Allow-Methods", accessControlRequestMethod);
			}

			return "OK";
		});
	}

	public static Object serveIndex(Request req, Response res)
	{
		return WebService.class.getResourceAsStream("static/index.html");
	}
}
