package org.fulib.projects;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class PathInfo
{
	private final Set<Editor> editors = ConcurrentHashMap.newKeySet();
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
}
