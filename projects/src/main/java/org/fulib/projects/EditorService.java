package org.fulib.projects;

import org.eclipse.jetty.websocket.api.Session;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class EditorService
{
	private final Map<String, Editor> editors = new ConcurrentHashMap<>();
	private final Map<String, PathInfo> paths = new ConcurrentHashMap<>();

	public void open(String editorId, String path, Session session)
	{
		final Editor editor = editors.computeIfAbsent(editorId, eid -> new Editor(eid, path, session));
		final PathInfo pathInfo = paths.computeIfAbsent(path, PathInfo::new);
		pathInfo.getEditors().add(editor);
		for (final String message : pathInfo.getMessages())
		{
			session.getRemote().sendString(message, null);
		}
	}

	public void close(String editorId)
	{
		final Editor editor = editors.remove(editorId);
		if (editor == null)
		{
			return;
		}
		final PathInfo pathInfo = paths.get(editor.getPath());
		if (pathInfo != null)
		{
			pathInfo.getEditors().remove(editor);
		}
	}

	public void save(String path)
	{
		final PathInfo pathInfo = paths.get(path);
		if (pathInfo == null)
		{
			return;
		}

		pathInfo.getMessages().clear();
	}

	public void broadcast(String editorId, String message)
	{
		final Editor editor = editors.get(editorId);
		if (editor == null)
		{
			return;
		}

		final PathInfo pathInfo = paths.get(editor.getPath());
		if (pathInfo == null)
		{
			return;
		}

		pathInfo.getMessages().add(message);
		for (final Editor otherEditor : pathInfo.getEditors())
		{
			if (otherEditor == editor)
			{
				continue;
			}

			otherEditor.getSession().getRemote().sendString(message, null);
		}
	}
}
