package org.fulib.webapp.projects;

import org.fulib.webapp.projects.db.FileRepository;
import org.fulib.webapp.projects.db.Mongo;
import org.fulib.webapp.projects.db.ProjectRepository;
import org.fulib.webapp.projects.docker.ContainerManager;
import org.fulib.webapp.projects.service.ProjectService;
import org.fulib.webapp.projects.zip.ProjectZip;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.Service;

import java.io.File;

public class Main
{
	// =============== Static Fields ===============

	private static final Logger LOGGER = LoggerFactory.getLogger(Main.class);

	public static final int PORT = 4568;

	// =============== Fields ===============

	private Service service;
	private final ProjectZip projectZip;
	private final Projects projects;

	// =============== Constructors ===============

	public Main(ProjectZip projectZip, Projects projects)
	{
		this.projectZip = projectZip;
		this.projects = projects;
	}

	// =============== Static Methods ===============

	public static void main(String[] args)
	{
		final Mongo mongo = new Mongo(System.getenv("FULIB_MONGO_URL"));
		final FileRepository fileRepository = new FileRepository(mongo);
		final ProjectRepository projectRepository = new ProjectRepository(mongo);
		final ContainerManager containerManager = new ContainerManager(fileRepository);
		final ProjectService projectService = new ProjectService(projectRepository, fileRepository, containerManager);
		final Projects projects = new Projects(projectService, fileRepository, containerManager);
		final ProjectZip projectZip = new ProjectZip();
		final Main service = new Main(projectZip, projects);
		service.start();
	}

	// =============== Methods ===============

	public void start()
	{
		service = Service.ignite();
		service.port(PORT);

		if (isDevEnv())
		{
			enableCORS();
		}

		service.path("/api", this::addApiRoutes);

		setupExceptionHandler();

		LOGGER.info("fulib.org Project service started on http://localhost:" + PORT);
	}

	private void addApiRoutes()
	{
		addMainRoutes();
		addProjectsRoutes();
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

	private boolean isDevEnv()
	{
		return new File("build.gradle").exists();
	}

	private void addMainRoutes()
	{
		service.post("/projectzip", projectZip::handle);
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
		service.get("/container", projects::getContainer);
		service.delete("/container", projects::deleteContainer);
	}

	private void setupExceptionHandler()
	{
		service.exception(Exception.class, (exception, request, response) -> {
			LOGGER.error("unhandled exception processing request", exception);
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
