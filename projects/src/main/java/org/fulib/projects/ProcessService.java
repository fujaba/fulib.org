package org.fulib.projects;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

public class ProcessService
{
	private final Map<String, ExecProcess> processes = new ConcurrentHashMap<>();

	public ExecProcess get(String id)
	{
		return processes.get(id);
	}

	public ExecProcess getOrCreate(String id, Function<? super String, ? extends ExecProcess> creator)
	{
		return processes.computeIfAbsent(id, creator);
	}

	public void stop()
	{
		for (final ExecProcess process : this.processes.values())
		{
			process.interrupt();
		}
	}

	public ExecProcess kill(String id)
	{
		final ExecProcess process = processes.remove(id);
		if (process != null)
		{
			process.interrupt();
		}
		return process;
	}
}
