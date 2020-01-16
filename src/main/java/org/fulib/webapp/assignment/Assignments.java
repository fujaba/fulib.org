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
}
