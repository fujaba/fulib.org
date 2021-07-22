package org.fulib.projects.terminal;

import org.eclipse.jetty.websocket.api.Session;
import org.fulib.projects.CommandHandler;
import org.json.JSONObject;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class TerminalCommandHandler implements CommandHandler
{
	private final TerminalService terminalService;

	public TerminalCommandHandler(TerminalService terminalService)
	{
		this.terminalService = terminalService;
	}

	@Override
	public boolean handle(String command, String message, JSONObject json, Session session) throws IOException
	{
		switch (command)
		{
		case "exec":
			exec(session, json);
			return true;
		case "input":
		{
			final String input = json.getString("text");
			final String processId = json.getString("process");
			final TerminalProcess process = this.terminalService.get(processId);
			if (process != null)
			{
				process.input(input);
			}
			return true;
		}
		case "kill":
		{
			final String processId = json.getString("process");
			this.terminalService.kill(processId);
			return true;
		}
		case "resize":
		{
			final String processId = json.getString("process");
			final int columns = json.getInt("columns");
			final int rows = json.getInt("rows");
			final TerminalProcess process = this.terminalService.get(processId);
			if (process != null)
			{
				process.resize(columns, rows);
			}
			return true;
		}
		}
		return false;
	}

	private void exec(Session session, JSONObject json)
	{
		final String id = json.getString("process");
		final TerminalProcess process = this.terminalService.getOrCreate(id, id1 -> createProcess(id1, json));
		process.getSessions().add(session);
	}

	private TerminalProcess createProcess(String id, JSONObject json)
	{
		final String[] cmd = json.getJSONArray("cmd").toList().toArray(new String[0]);
		final String workingDirectory = json.optString("workingDirectory");

		final JSONObject environmentObj = json.optJSONObject("environment");
		Map<String, String> environment = null;
		if (environmentObj != null)
		{
			environment = new HashMap<>();
			for (final String key : environmentObj.keySet())
			{
				environment.put(key, environmentObj.get(key).toString());
			}
		}

		final TerminalProcess newProcess = new TerminalProcess(id, cmd, workingDirectory, environment);
		newProcess.start();
		return newProcess;
	}
}
