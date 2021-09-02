package org.fulib.webapp;

import org.fulib.webapp.assignment.Assignments;
import org.fulib.webapp.assignment.Comments;
import org.fulib.webapp.assignment.Courses;
import org.fulib.webapp.assignment.Solutions;
import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.tool.MarkdownUtil;
import org.fulib.webapp.tool.RunCodeGen;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.Service;

import java.io.File;
import java.util.Properties;

public class WebService
{
	// =============== Static Fields ===============

	private static final Logger LOGGER = LoggerFactory.getLogger(WebService.class);

	public static final Properties VERSIONS = new Properties();

	static
	{
		try
		{
			VERSIONS.load(WebService.class.getResourceAsStream("version.properties"));
		}
		catch (Exception e)
		{
			LOGGER.error("failed to load version.properties", e);
		}
	}

	// =============== Fields ===============

	private Service service;
	private final MarkdownUtil markdownUtil = new MarkdownUtil();
	private final RunCodeGen runCodeGen;
	private final Assignments assignments;
	private final Comments comments;
	private final Solutions solutions;
	private final Courses courses;

	// =============== Constructors ===============

	public WebService()
	{
		this(new Mongo(System.getenv("FULIB_MONGO_URL")));
	}

	WebService(Mongo db)
	{
		this(db, new MarkdownUtil(), new RunCodeGen(db));
	}

	WebService(Mongo db, MarkdownUtil markdownUtil, RunCodeGen runCodeGen)
	{
		this(runCodeGen, new Assignments(markdownUtil, db), new Comments(markdownUtil, db),
		     new Solutions(runCodeGen, db), new Courses(markdownUtil, db));
	}

	WebService(RunCodeGen runCodeGen, Assignments assignments, Comments comments, Solutions solutions, Courses courses)
	{
		this.runCodeGen = runCodeGen;
		this.assignments = assignments;
		this.comments = comments;
		this.solutions = solutions;
		this.courses = courses;
	}

	// =============== Static Methods ===============

	public static void main(String[] args)
	{
		new WebService().start();
	}

	// =============== Methods ===============

	public void start()
	{
		service = Service.ignite();
		service.port(4567);

		new File(this.runCodeGen.getTempDir()).mkdirs();

		service.staticFiles.externalLocation(this.runCodeGen.getTempDir());
		service.staticFiles.expireTime(60 * 60);

		if (System.getenv("FULIB_CORS") != null)
		{
			enableCORS();
		}

		// all endpoints available with and without /api for backward compatibility
		// TODO remove endpoints without /api in v2
		addApiRoutes();
		service.path("/api", this::addApiRoutes);

		setupExceptionHandler();

		LOGGER.info("fulib.org service started on http://localhost:4567");
	}

	private void addApiRoutes()
	{
		addMainRoutes();
		this.service.get("/solutions", this.solutions::getAll);
		addAssignmentsRoutes();
		addCoursesRoutes();
		addUtilRoutes();
	}

	void awaitStart()
	{
		service.awaitInitialization();
	}

	void awaitStop()
	{
		service.awaitStop();
	}

	// --------------- Helpers ---------------

	private void addMainRoutes()
	{
		service.post("/runcodegen", runCodeGen::handle);
		service.get("/versions", (req, res) -> new JSONObject(VERSIONS).toString(2));
	}

	private void addUtilRoutes()
	{
		service.post("/rendermarkdown", (request, response) -> {
			final String imageBaseUrl = request.queryParams("image_base_url");
			final String linkBaseUrl = request.queryParams("link_base_url");
			final MarkdownUtil util;
			if (imageBaseUrl != null || linkBaseUrl != null)
			{
				util = new MarkdownUtil();
				util.setImageBaseUrl(imageBaseUrl);
				util.setLinkBaseUrl(linkBaseUrl);
			}
			else
			{
				util = this.markdownUtil;
			}
			response.type("text/html");
			return util.renderHtml(request.body());
		});
	}

	private void addCoursesRoutes()
	{
		service.path("/courses", () -> {
			service.post("", courses::create);
			service.get("", courses::getAll);
			service.get("/:courseID", courses::get);
		});
	}

	private void setupExceptionHandler()
	{
		service.exception(Exception.class, (exception, request, response) -> {
			LOGGER.error("unhandled exception processing request", exception);
		});
	}

	private void addAssignmentsRoutes()
	{
		service.path("/assignments", () -> {
			service.get("", assignments::getAll);
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
			service.get("", solutions::getByAssignment);

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

			service.delete("/:commentID", comments::delete);
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
}
