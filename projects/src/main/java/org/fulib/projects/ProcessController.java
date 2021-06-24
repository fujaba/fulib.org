package org.fulib.projects;

import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

public class ProcessController
{
	private final ProcessService processService;

	public ProcessController(ProcessService processService)
	{
		this.processService = processService;
	}

	public Object getAll(Request request, Response response)
	{
		final JSONArray array = new JSONArray();
		for (final ExecProcess process : processService.getAll())
		{
			final JSONObject obj = new JSONObject();
			obj.put("process", process.getExecId());
			obj.put("cmd", process.getCmd());
			obj.put("workingDirectory", process.getWorkingDirectory());
			obj.put("environment", process.getEnvironment());
			array.put(obj);
		}
		return array.toString();
	}
}
