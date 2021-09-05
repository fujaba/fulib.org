package org.fulib.webapp;

import org.fulib.webapp.projectzip.ProjectZipController;
import org.fulib.webapp.tool.MarkdownUtil;
import org.fulib.webapp.tool.RunCodeGen;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import spark.Service;

import javax.inject.Inject;
import java.io.File;
import java.util.Properties;

public class Main
{
	private static final int PORT = 4567;

	private static final Logger LOGGER = LoggerFactory.getLogger(Main.class);

	public static final Properties VERSIONS = new Properties();

	static
	{
		try
		{
			VERSIONS.load(Main.class.getResourceAsStream("version.properties"));
		}
		catch (Exception e)
		{
			LOGGER.error("failed to load version.properties", e);
		}
	}

	// =============== Fields ===============

	private Service service;
	private final RunCodeGen runCodeGen;
	private final ProjectZipController projectZipController;

	// =============== Constructors ===============

	@Inject
	Main(RunCodeGen runCodeGen, ProjectZipController projectZipController)
	{
		this.runCodeGen = runCodeGen;
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
		service.post("/runcodegen", runCodeGen::handle);
		service.get("/versions", (req, res) -> new JSONObject(VERSIONS).toString(2));
		service.post("/projectzip", projectZipController::handle);
		service.post("/rendermarkdown", (request, response) -> {
			final String imageBaseUrl = request.queryParams("image_base_url");
			final String linkBaseUrl = request.queryParams("link_base_url");
			final MarkdownUtil util = new MarkdownUtil();
			if (imageBaseUrl != null)
			{
				util.setImageBaseUrl(imageBaseUrl);
			}
			if (linkBaseUrl != null)
			{
				util.setLinkBaseUrl(linkBaseUrl);
			}
			response.type("text/html");
			return util.renderHtml(request.body());
		});
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
