package org.fulib.projects.fsevents;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class FileWatcherRegistry
{
	private final FileWatcherProcess process;

	private final Map<String, String> idToPath = new ConcurrentHashMap<>();
	private final Map<String, Set<String>> pathToIds = new ConcurrentHashMap<>();

	public FileWatcherRegistry(FileWatcherProcess process)
	{
		this.process = process;
	}

	public void watch(String id, String path)
	{
		this.idToPath.put(id, path);
		this.pathToIds.compute(path, (s, old) -> {
			if (old == null)
			{
				old = new HashSet<>();
				this.process.watch(path);
			}

			old.add(id);
			return old;
		});
	}

	public void unwatch(String id)
	{
		final String path = this.idToPath.remove(id);
		if (path == null)
		{
			return;
		}

		this.pathToIds.compute(path, (s, old) -> {
			if (old == null) {
				return null;
			}
			old.remove(id);
			if (old.isEmpty())
			{
				this.process.unwatch(path);
				return null;
			}
			return old;
		});
	}
}
