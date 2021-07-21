package org.fulib.projects;

import java.util.Queue;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

public class PathInfo
{
	private final Set<Editor> editors = ConcurrentHashMap.newKeySet();
	private final Queue<String> messages = new ConcurrentLinkedQueue<>();
	private final String path;

	public PathInfo(String path)
	{
		this.path = path;
	}

	public String getPath()
	{
		return path;
	}

	public Set<Editor> getEditors()
	{
		return editors;
	}

	public Queue<String> getMessages()
	{
		return messages;
	}
}
