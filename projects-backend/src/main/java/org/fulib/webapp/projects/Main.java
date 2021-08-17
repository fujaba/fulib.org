package org.fulib.webapp.projects;

import org.fulib.webapp.projects.containers.ContainerController;
import org.fulib.webapp.projects.members.MemberController;
import org.fulib.webapp.projects.projects.ProjectController;
import org.fulib.webapp.projects.projectzip.ProjectZipController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.Service;

import javax.inject.Inject;
import java.io.File;

public class Main
{
	// =============== Static Fields ===============

	private static final Logger LOGGER = LoggerFactory.getLogger(Main.class);

	public static final int PORT = 4568;

	// =============== Fields ===============

	private final ProjectZipController projectZipController;
	private final ProjectController projectController;
	private final ContainerController containerController;
	private final MemberController memberController;

	private Service service;

	// =============== Constructors ===============

	@Inject
	public Main(ProjectZipController projectZipController, ProjectController projectController,
		ContainerController containerController, MemberController memberController)
	{
		this.projectZipController = projectZipController;
		this.projectController = projectController;
		this.containerController = containerController;
		this.memberController = memberController;
	}

	// =============== Static Methods ===============

	public static void main(String[] args)
	{
		final Main main = DaggerMainFactory.create().main();
		main.start();
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
			service.post("/container", containerController::create);

			service.path("/:projectId", this::addProjectRoutes);
		});
	}

	private void addProjectRoutes()
	{
		service.get("", projectController::get);
		service.put("", projectController::update);
		service.delete("", projectController::delete);
		service.path("/members", () -> {
			service.get("", memberController::getAll);
			service.get("/:userId", memberController::getOne);
			service.put("/:userId", memberController::updateOne);
			service.delete("/:userId", memberController::deleteOne);
		});
		service.get("/container", containerController::get);
		service.post("/container", containerController::create);
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
