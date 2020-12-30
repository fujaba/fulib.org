package org.fulib.webapp.projects.docker;

import org.eclipse.jetty.websocket.api.Session;
import org.json.JSONObject;

public class FileEventManager implements FileEventHandler
{
	private final Session session;

	public FileEventManager(Session session)
	{
		this.session = session;
	}

	@Override
	public void modify(String path)
	{
		send(new JSONObject().put("event", "modified").put("path", path));
	}

	@Override
	public void createFile(String path)
	{
		send(new JSONObject().put("event", "created").put("path", path));
	}

	@Override
	public void createDirectory(String path)
	{
		send(new JSONObject().put("event", "created").put("path", path).put("directory", true));
	}

	@Override
	public void delete(String path)
	{
		send(new JSONObject().put("event", "deleted").put("path", path));
	}

	@Override
	public void move(String oldPath, String newPath)
	{
		send(new JSONObject().put("event", "moved").put("from", oldPath).put("to", newPath));
	}

	private void send(JSONObject message)
	{
		this.session.getRemote().sendString(message.toString(), null);
	}
}
