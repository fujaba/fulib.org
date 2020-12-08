package org.fulib.webapp;

import org.fulib.webapp.assignment.Assignments;
import org.fulib.webapp.assignment.Comments;
import org.fulib.webapp.assignment.Courses;
import org.fulib.webapp.assignment.Solutions;
import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.projects.Files;
import org.fulib.webapp.projects.Projects;
import org.fulib.webapp.projectzip.ProjectZip;
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

	public static final String PASSWORD_ENV_KEY = "FULIB_ORG_MONGODB_PASSWORD";
	public static final String HOST_ENV_KEY = "FULIB_ORG_MONGODB_HOST";
	public static final String USER_ENV_KEY = "FULIB_ORG_MONGODB_USER";

	// =============== Fields ===============

	private Service service;
	private final MarkdownUtil markdownUtil = new MarkdownUtil();
	private final RunCodeGen runCodeGen;
	private final ProjectZip projectZip;
	private final Projects projects;
	private final Files files;
	private final Assignments assignments;
	private final Comments comments;
	private final Solutions solutions;
	private final Courses courses;

	// =============== Constructors ===============

	public WebService()
	{
		this(new Mongo(getMongoURL()));
	}

	WebService(Mongo db)
	{
		this(db, new MarkdownUtil(), new RunCodeGen(db));
	}

	WebService(Mongo db, MarkdownUtil markdownUtil, RunCodeGen runCodeGen)
	{
		this(runCodeGen, new ProjectZip(db), new Projects(db), new Files(db), new Assignments(markdownUtil, db),
		     new Comments(markdownUtil, db), new Solutions(runCodeGen, db), new Courses(markdownUtil, db));
	}

	WebService(RunCodeGen runCodeGen, ProjectZip projectZip, Projects projects, Files files, Assignments assignments,
		Comments comments, Solutions solutions, Courses courses)
	{
		this.runCodeGen = runCodeGen;
		this.projectZip = projectZip;
		this.projects = projects;
		this.files = files;
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

		if (isDevEnv())
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
		addProjectsRoutes();
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

	public static String getMongoURL()
	{
		final String host = System.getenv(HOST_ENV_KEY);
		if (host == null || host.isEmpty())
		{
			return null;
		}

		final String user = System.getenv(USER_ENV_KEY);
		if (user == null || user.isEmpty())
		{
			return null;
		}

		final String password = System.getenv(PASSWORD_ENV_KEY);
		if (password == null || password.isEmpty())
		{
			return null;
		}

		return "mongodb://" + user + ":" + password + "@" + host;
	}

	private boolean isDevEnv()
	{
		return new File("build.gradle").exists();
	}

	private void addMainRoutes()
	{
		service.post("/runcodegen", runCodeGen::handle);
		service.post("/projectzip", projectZip::handle);
		service.get("/versions", (req, res) -> new JSONObject(VERSIONS).toString(2));
	}

	private void addProjectsRoutes()
	{
		service.path("/projects", () -> {
			service.post("", projects::create);
			service.get("", projects::getAll);

			service.path("/:projectId", this::addProjectRoutes);
		});
	}

	private void addProjectRoutes()
	{
		service.get("", projects::get);
		service.put("", projects::update);
		service.delete("", projects::delete);
		service.post("/exec", projects::exec);

		service.path("/files", this::addFilesRoutes);
	}

	private void addFilesRoutes()
	{
		service.get("", files::getChildren);
		service.post("", files::create);
		service.path("/:fileId", this::addFileRoutes);
	}

	private void addFileRoutes()
	{
		service.get("", files::get);
		service.put("", files::update);
		service.delete("", files::delete);

		service.get("/content", files::download);
		service.put("/content", files::upload);
	}

	private void addUtilRoutes()
	{
		service.post("/rendermarkdown", (request, response) -> {
			response.type("text/html");
			return this.markdownUtil.renderHtml(request.body());
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
