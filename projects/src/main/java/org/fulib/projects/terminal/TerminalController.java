package org.fulib.projects.terminal;

import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

public class TerminalController
{
	private final TerminalService terminalService;

	public TerminalController(TerminalService terminalService)
	{
		this.terminalService = terminalService;
	}

	public Object getAll(Request request, Response response)
	{
		final JSONArray array = new JSONArray();
		for (final TerminalProcess process : terminalService.getAll())
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
