package org.fulib.webapp.projects;

import org.fulib.webapp.projects.controller.ContainerController;
import org.fulib.webapp.projects.controller.ProjectController;
import org.fulib.webapp.projects.controller.ProjectZipController;
import org.fulib.webapp.projects.db.FileRepository;
import org.fulib.webapp.projects.db.Mongo;
import org.fulib.webapp.projects.db.ProjectRepository;
import org.fulib.webapp.projects.docker.ContainerManager;
import org.fulib.webapp.projects.service.ContainerService;
import org.fulib.webapp.projects.service.ProjectGenerator;
import org.fulib.webapp.projects.service.ProjectService;
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
	private final ProjectZipController projectZipController;
	private final ProjectController projectController;
	private final ContainerController containerController;

	// =============== Constructors ===============

	public Main(ProjectZipController projectZipController, ProjectController projectController,
		ContainerController containerController)
	{
		this.projectZipController = projectZipController;
		this.projectController = projectController;
		this.containerController = containerController;
	}

	// =============== Static Methods ===============

	public static void main(String[] args)
	{
		final Mongo mongo = new Mongo(System.getenv("FULIB_MONGO_URL"));
		final FileRepository fileRepository = new FileRepository(mongo);
		final ProjectRepository projectRepository = new ProjectRepository(mongo);
		final ContainerManager containerManager = new ContainerManager(fileRepository);
		final ContainerService containerService = new ContainerService(containerManager);
		final ProjectGenerator projectGenerator = new ProjectGenerator();
		final ProjectService projectService = new ProjectService(projectRepository, fileRepository, containerManager,
		                                                         projectGenerator);
		final ContainerController containerController = new ContainerController(projectService, containerService);
		final ProjectController projectController = new ProjectController(projectService);
		final ProjectZipController projectZipController = new ProjectZipController(projectGenerator);
		final Main service = new Main(projectZipController, projectController, containerController);
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
		service.post("/projectzip", projectZipController::handle);
	}

	private void addProjectsRoutes()
	{
		service.path("/projects", () -> {
			service.post("", projectController::create);
			service.get("", projectController::getAll);

			service.path("/:projectId", this::addProjectRoutes);
		});
	}

	private void addProjectRoutes()
	{
		service.get("", projectController::get);
		service.put("", projectController::update);
		service.delete("", projectController::delete);
		service.get("/container", containerController::get);
		service.delete("/container", containerController::delete);
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
