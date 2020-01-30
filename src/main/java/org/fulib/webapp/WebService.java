package org.fulib.webapp;

import org.fulib.webapp.assignment.Assignments;
import org.fulib.webapp.assignment.Comments;
import org.fulib.webapp.assignment.Solutions;
import org.fulib.webapp.projectzip.ProjectZip;
import org.fulib.webapp.tool.RunCodeGen;
import spark.Service;

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

		final String staticFolder = "/org/fulib/webapp/static";
		final String resourceFolder = "src/main/resources" + staticFolder;
		if (new File(resourceFolder).exists())
		{
			service.staticFiles.externalLocation(resourceFolder);
		}
		else
		{
			service.staticFiles.location(staticFolder);
		}

		service.redirect.get("/github", "https://github.com/fujaba/fulib.org");

		service.post("/runcodegen", RunCodeGen::handle);
		service.post("/projectzip", ProjectZip::handle);
		service.post("/assignment", Assignments::create);
		service.get("/assignment/:id", Assignments::get);

		service.post("/assignment/:assignmentID/solution", Solutions::create);
		service.get("/assignment/:assignmentID/solution/:solutionID", Solutions::get);
		service.get("/assignment/:assignmentID/solutions", Solutions::getAll);
		service.post("/assignment/:assignmentID/check", Solutions::check);

		service.get("/assignment/:assignmentID/solution/:solutionID/assignee", Solutions::getAssignee);
		service.put("/assignment/:assignmentID/solution/:solutionID/assignee", Solutions::setAssignee);

		service.get("/assignment/:assignmentID/solution/:parentID/comments", Comments::getChildren);
		service.post("/assignment/:assignmentID/solution/:parentID/comments", Comments::post);

		service.exception(Exception.class, (exception, request, response) -> {
			Logger.getGlobal().log(Level.SEVERE, "unhandled exception processing request", exception);
		});

		Logger.getGlobal().info("scenario server started on http://localhost:4567");
	}
}
