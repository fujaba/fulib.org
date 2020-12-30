package org.fulib.webapp.projects;

import org.eclipse.jetty.websocket.api.Session;
import org.json.JSONObject;

import java.io.IOException;
import java.io.Writer;

public class SessionOutputWriter extends Writer
{
	private final Session session;
	String execId;

	public SessionOutputWriter(Session session)
	{
		this.session = session;
	}

	@Override
	public void write(char[] cbuf, int off, int len) throws IOException
	{
		final JSONObject message = new JSONObject();
		message.put("event", "output");
		message.put("process", execId);
		message.put("text", new String(cbuf, off, len));
		session.getRemote().sendString(message.toString());
	}

	@Override
	public void flush()
	{
	}

	@Override
	public void close()
	{
	}
}
