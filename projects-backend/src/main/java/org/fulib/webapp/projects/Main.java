package org.fulib.webapp.projects;

import org.fulib.webapp.projects.projectzip.ProjectZipController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.Service;

import javax.inject.Inject;

public class Main
{
	// =============== Static Fields ===============

	private static final Logger LOGGER = LoggerFactory.getLogger(Main.class);

	public static final int PORT = 4568;

	// =============== Fields ===============

	private final ProjectZipController projectZipController;

	private Service service;

	// =============== Constructors ===============

	@Inject
	public Main(ProjectZipController projectZipController)
	{
		this.projectZipController = projectZipController;
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

		if (System.getenv("FULIB_CORS") != null)
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
		service.post("/projectzip", projectZipController::handle);
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
