package org.fulib.projects;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.json.JSONObject;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@WebSocket
public class WebSocketHandler implements FileEventHandler
{
	private final Runnable resetShutdownTimer;

	private final Map<Session, Map<String, ExecProcess>> processes = new ConcurrentHashMap<>();

	public WebSocketHandler(Runnable resetShutdownTimer)
	{
		this.resetShutdownTimer = resetShutdownTimer;
	}

	@OnWebSocketConnect
	public void connected(Session session)
	{
		processes.put(session, new ConcurrentHashMap<>());
	}

	@OnWebSocketMessage
	public void message(Session session, String message) throws IOException
	{
		final JSONObject json = new JSONObject(message);
		final String command = json.getString("command");

		switch (command)
		{
		case "exec":
		{
			final String[] cmd = json.getJSONArray("cmd").toList().toArray(new String[0]);
			final ExecProcess process = new ExecProcess(cmd, session);
			this.processes.get(session).put(process.getExecId(), process);
			process.start();
			return;
		}
		case "input":
		{
			final String input = json.getString("text");
			final String processId = json.getString("process");
			final ExecProcess process = this.processes.get(session).get(processId);
			if (process != null)
			{
				process.input(input);
			}
			return;
		}
		case "kill":
		{
			final String processId = json.getString("process");
			final ExecProcess process = this.processes.get(session).remove(processId);
			if (process != null)
			{
				process.interrupt();
			}
			return;
		}
		case "keepAlive":
			this.resetShutdownTimer.run();
			return;
		case "resize":
		{
			final String processId = json.getString("process");
			final int columns = json.getInt("columns");
			final int rows = json.getInt("rows");
			final ExecProcess process = this.processes.get(session).get(processId);
			if (process != null)
			{
				process.resize(columns, rows);
			}
			return;
		}
		default:
			session.getRemote().sendString(new JSONObject().put("error", "invalid command: " + command).toString());
			return;
		}
	}

	@OnWebSocketClose
	public void disconnected(Session session, int status, String reason)
	{
		final Map<String, ExecProcess> execMap = processes.remove(session);
		for (final ExecProcess value : execMap.values())
		{
			value.interrupt();
		}
	}

	@Override
	public void modify(String path)
	{
		broadcast(new JSONObject().put("event", "modified").put("path", path));
	}

	@Override
	public void create(String path)
	{
		broadcast(new JSONObject().put("event", "created").put("path", path));
	}

	@Override
	public void delete(String path)
	{
		broadcast(new JSONObject().put("event", "deleted").put("path", path));
	}

	@Override
	public void move(String oldPath, String newPath)
	{
		broadcast(new JSONObject().put("event", "moved").put("from", oldPath).put("to", newPath));
	}

	private void broadcast(JSONObject obj)
	{
		final String message = obj.toString();
		for (final Session session : this.processes.keySet())
		{
			session.getRemote().sendString(message, null);
		}
	}
}
