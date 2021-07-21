package org.fulib.projects;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.*;
import org.json.JSONObject;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentLinkedQueue;

@WebSocket
public class WebSocketHandler implements FileEventHandler
{
	private FileWatcherRegistry fileWatcher;
	private ProcessService processService;
	private EditorService editorService;
	private final Runnable resetShutdownTimer;

	private final Collection<Session> sessions = new ConcurrentLinkedQueue<>();

	public WebSocketHandler(Runnable resetShutdownTimer)
	{
		this.resetShutdownTimer = resetShutdownTimer;
	}

	public void setFileWatcher(FileWatcherRegistry fileWatcher)
	{
		this.fileWatcher = fileWatcher;
	}

	public void setProcessService(ProcessService processService)
	{
		this.processService = processService;
	}

	public void setEditorService(EditorService editorService)
	{
		this.editorService = editorService;
	}

	@OnWebSocketConnect
	public void connected(Session session)
	{
		this.sessions.add(session);
	}

	@OnWebSocketMessage
	public void message(Session session, String message) throws IOException
	{
		final JSONObject json = new JSONObject(message);
		final String command = json.optString("command");
		if (command == null)
		{
			return;
		}

		switch (command)
		{
		case "watch":
		{
			final String id = json.getString("id");
			final String path = json.getString("path");
			this.fileWatcher.watch(id, path);
			return;
		}
		case "unwatch":
		{
			final String id = json.getString("id");
			this.fileWatcher.unwatch(id);
			return;
		}
		case "exec":
			exec(session, json);
			return;
		case "input":
		{
			final String input = json.getString("text");
			final String processId = json.getString("process");
			final ExecProcess process = this.processService.get(processId);
			if (process != null)
			{
				process.input(input);
			}
			return;
		}
		case "kill":
		{
			final String processId = json.getString("process");
			this.processService.kill(processId);
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
			final ExecProcess process = this.processService.get(processId);
			if (process != null)
			{
				process.resize(columns, rows);
			}
			return;
		}
		case "editor.open":
		case "editor.close":
		case "editor.change":
		case "editor.cursor":
		case "editor.save":
			this.handleEditor(session, command, json, message);
			return;
		default:
			session.getRemote().sendString(new JSONObject().put("error", "invalid command: " + command).toString());
			return;
		}
	}

	private void handleEditor(Session session, String command, JSONObject json, String message)
	{
		final String editorId = json.getString("editorId");
		this.editorService.broadcast(editorId, message);

		switch (command)
		{
		case "editor.save":
			this.editorService.save(json.getString("path"));
			return;
		case "editor.open":
			this.editorService.open(json.getString("editorId"), json.getString("path"), session);
			return;
		case "editor.close":
			this.editorService.close(editorId);
			return;
		}
	}

	private void exec(Session session, JSONObject json)
	{
		final String id = json.getString("process");
		final ExecProcess process = this.processService.getOrCreate(id, id1 -> createProcess(session, id1, json));
		process.setSession(session);
	}

	private ExecProcess createProcess(Session session, String id, JSONObject json)
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

		final ExecProcess newProcess = new ExecProcess(id, session, cmd, workingDirectory, environment);
		newProcess.start();
		return newProcess;
	}

	@OnWebSocketError
	public void error(Session session, Throwable error)
	{
		error.printStackTrace();
		final String text = new JSONObject().put("event", "error").put("message", error.getMessage()).toString();
		session.getRemote().sendString(text, null);
	}

	@OnWebSocketClose
	public void disconnected(Session session, int status, String reason)
	{
		this.sessions.remove(session);
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
		for (final Session session : this.sessions)
		{
			session.getRemote().sendString(message, null);
		}
	}
}
