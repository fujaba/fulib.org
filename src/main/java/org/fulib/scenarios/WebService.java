package org.fulib.scenarios;

import org.fulib.scenarios.tool.ProjectZip;
import org.fulib.scenarios.tool.RunCodeGen;
import spark.Service;

import java.io.IOException;
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
			props.load(WebService.class.getResourceAsStream("/org/fulib/webapp/version.properties"));
		}
		catch (IOException e)
		{
			Logger.getGlobal().throwing("WebService", "static init", e);
		}

		VERSION = props.getProperty("webapp.version");
		FULIB_SCENARIOS_VERSION = props.getProperty("fulib-scenarios.version");
		FULIB_MOCKUPS_VERSION = props.getProperty("fulib-mockups.version");
	}

	public static void main(String[] args)
	{
		final Service service = Service.ignite();

		service.port(4567);

		service.staticFiles.location("/webapp");
		service.redirect.get("/github", "https://github.com/fujaba/fulib.org");

		service.post("/runcodegen", RunCodeGen::handle);
		service.post("/projectzip", ProjectZip::handle);

		service.exception(Exception.class, (exception, request, response) -> {
			Logger.getGlobal().log(Level.SEVERE, "unhandled exception processing request", exception);
		});

		Logger.getGlobal().info("scenario server started on http://localhost:4567");
	}
}
