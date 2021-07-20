package org.fulib.projects;

import org.eclipse.jetty.websocket.api.Session;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class EditorService
{
	private final Map<String, Editor> editors = new ConcurrentHashMap<>();
	private final Map<String, Set<Editor>> subscriptions = new ConcurrentHashMap<>();

	public void open(String editorId, String path, Session session)
	{
		final Editor editor = editors.computeIfAbsent(editorId, eid -> new Editor(eid, path, session));
		subscriptions.computeIfAbsent(path, p -> ConcurrentHashMap.newKeySet()).add(editor);
	}

	public void close(String editorId)
	{
		final Editor editor = editors.remove(editorId);
		if (editor == null)
		{
			return;
		}
		final Set<Editor> editors = subscriptions.get(editor.getPath());
		if (editors != null)
		{
			editors.remove(editor);
		}
	}

	public void broadcast(String editorId, String message)
	{
		final Editor editor = editors.get(editorId);
		if (editor == null)
		{
			return;
		}

		final Set<Editor> editors = subscriptions.get(editor.getPath());
		if (editors == null)
		{
			return;
		}

		for (final Editor otherEditor : editors)
		{
			if (otherEditor == editor)
			{
				continue;
			}

			otherEditor.getSession().getRemote().sendString(message, null);
		}
	}
}
