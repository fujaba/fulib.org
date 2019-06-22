package org.fulib.scenarios;

import org.fulib.scenarios.tool.ProjectZip;
import org.fulib.scenarios.tool.RunCodeGen;
import spark.Service;

import java.util.logging.Level;
import java.util.logging.Logger;

public class WebService
{
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
