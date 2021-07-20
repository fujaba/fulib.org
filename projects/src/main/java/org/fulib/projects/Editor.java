package org.fulib.projects;

import org.eclipse.jetty.websocket.api.Session;

public class Editor
{
	private final String id;
	private final String path;
	private final Session session;

	public Editor(String id, String path, Session session)
	{
		this.id = id;
		this.path = path;
		this.session = session;
	}

	public String getId()
	{
		return id;
	}

	public String getPath()
	{
		return path;
	}

	public Session getSession()
	{
		return session;
	}
}
