package org.fulib.webapp.assignment;

import org.json.JSONObject;
import spark.Request;
import spark.Response;

import java.util.UUID;

public class Assignments
{
	public static Object create(Request request, Response response)
	{
		JSONObject responseJson = new JSONObject();

		responseJson.put("id", UUID.randomUUID());

		return responseJson.toString(2);
	}

	public static Object get(Request request, Response response)
	{
		final String id = request.params("id");

		if (request.contentType() != null && request.contentType().startsWith("application/json"))
		{
			// language=JSON
			return "{\n" + "  \"title\": \"it works\",\n" + "  \"description\": \"foo bar baz\",\n"
			       + "  \"author\": \"me\",\n" + "  \"email\": \"me@example.com\"\n" + "}";
		}
		else
		{
			response.redirect("/assignment/view.html?id=" + id);
			return "";
		}
	}
}
