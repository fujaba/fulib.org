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
		final String processId = json.optString("process");

		switch (command)
		{
		case "terminal.exec":
			exec(session, json);
			return true;
		case "terminal.attach":
			attach(session, processId);
			return true;
		case "terminal.detach":
			detach(session, processId);
			return true;
		case "terminal.input":
			input(processId, json.getString("text"));
			return true;
		case "terminal.resize":
			resize(processId, json.getInt("columns"), json.getInt("rows"));
			return true;
		case "terminal.kill":
			terminalService.kill(processId);
			return true;
		}
		return false;
	}

	private void exec(Session session, JSONObject json)
	{
		final String id = json.getString("process");
		final TerminalProcess process = terminalService.getOrCreate(id, id1 -> createProcess(id1, json));
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

	private void attach(Session session, String processId)
	{
		final TerminalProcess process = terminalService.get(processId);
		if (process != null)
		{
			process.getSessions().add(session);
		}
	}

	private void detach(Session session, String processId)
	{
		final TerminalProcess process = terminalService.get(processId);
		if (process != null)
		{
			process.getSessions().remove(session);
		}
	}

	private void input(String processId, String input) throws IOException
	{
		final TerminalProcess process = terminalService.get(processId);
		if (process != null)
		{
			process.input(input);
		}
	}

	private void resize(String processId, int columns, int rows)
	{
		final TerminalProcess process = terminalService.get(processId);
		if (process != null)
		{
			process.resize(columns, rows);
		}
	}
}
