package org.fulib.webapp;

import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.projectzip.ProjectZip;
import org.fulib.webapp.tool.RunCodeGen;
import spark.Service;
import spark.staticfiles.StaticFilesConfiguration;

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

		final StaticFilesConfiguration staticHandler = new StaticFilesConfiguration();
		final String staticFolder = "/org/fulib/webapp/static";
		final String resourceFolder = "src/main/resources" + staticFolder;
		if (new File(resourceFolder).exists())
		{
			// dev environment, allow CORS
			enableCORS(service);

			staticHandler.configureExternal(resourceFolder);
		}
		else
		{
			staticHandler.configure(staticFolder);
		}
		service.before((request, response) -> staticHandler.consume(request.raw(), response.raw()));

		service.redirect.get("/github", "https://github.com/fujaba/fulib.org");

		final Mongo db = Mongo.get();
		final RunCodeGen runCodeGen = new RunCodeGen(db);

		service.post("/runcodegen", runCodeGen::handle);
		service.post("/projectzip", ProjectZip::handle);

		service.exception(Exception.class, (exception, request, response) -> {
			Logger.getGlobal().log(Level.SEVERE, "unhandled exception processing request", exception);
		});

		Logger.getGlobal().info("scenario server started on http://localhost:4567");
	}

	private static void enableCORS(Service service)
	{
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
}
