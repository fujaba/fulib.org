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

	public static void main(String[] args)
	{
		final Service service = Service.ignite();

		service.port(4567);

		service.staticFiles.location("/org/fulib/webapp/static");

		if (new File("build.gradle").exists())
		{
			// dev environment, allow CORS
			enableCORS(service);
		}

		service.redirect.get("/github", "https://github.com/fujaba/fulib.org");

		final Mongo db = Mongo.get();
		final RunCodeGen runCodeGen = new RunCodeGen(db);

		service.post("/runcodegen", runCodeGen::handle);
		service.post("/projectzip", ProjectZip::handle);

		addAssignmentsRoutes(service);

		service.path("/courses", () -> {
			service.post("", Courses::create);
			service.get("/:courseID", Courses::get);
		});

		service.post("/rendermarkdown", (request, response) -> {
			response.type("text/html");
			return MarkdownUtil.renderHtml(request.body());
		});

		service.notFound(WebService::serveIndex);

		service.exception(Exception.class, (exception, request, response) -> {
			Logger.getGlobal().log(Level.SEVERE, "unhandled exception processing request", exception);
		});

		Logger.getGlobal().info("scenario server started on http://localhost:4567");
	}

	private static void addAssignmentsRoutes(Service service)
	{
		service.path("/assignments", () -> {
			service.post("", Assignments::create);

			service.path("/:assignmentID", () -> addAssignmentRoutes(service));
		});
	}

	private static void addAssignmentRoutes(Service service)
	{
		service.get("", Assignments::get);

		service.post("/check", Solutions::check);

		addSolutionsRoutes(service);
	}

	private static void addSolutionsRoutes(Service service)
	{
		service.path("/solutions", () -> {
			service.post("", Solutions::create);
			service.get("", Solutions::getAll);

			service.path("/:solutionID", () -> addSolutionRoutes(service));
		});
	}

	private static void addSolutionRoutes(Service service)
	{
		service.get("", Solutions::get);

		service.path("/assignee", () -> {
			service.get("", Solutions::getAssignee);
			service.put("", Solutions::setAssignee);
		});

		service.path("/gradings", () -> {
			service.post("", Solutions::postGrading);
			service.get("", Solutions::getGradings);
		});

		service.path("/comments", () -> {
			service.post("", Comments::post);
			service.get("", Comments::getChildren);
		});
	}

	private static void enableCORS(Service service)
	{
		service.staticFiles.header("Access-Control-Allow-Origin", "*");

		service.before((request, response) -> response.header("Access-Control-Allow-Origin", "*"));

		service.options("/*", (req, res) -> {
			String accessControlRequestHeaders = req.headers("Access-Control-Request-Headers");
			if (accessControlRequestHeaders != null) {
				res.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
			}

			String accessControlRequestMethod = req.headers("Access-Control-Request-Method");
			if (accessControlRequestMethod != null) {
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
