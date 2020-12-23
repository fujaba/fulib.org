package org.fulib.webapp.projects;

import com.github.dockerjava.api.DockerClient;

public class FileWatcher extends Thread
{
	private final ContainerManager manager;

	public FileWatcher(ContainerManager manager)
	{
		this.manager = manager;
	}

	@Override
	public void run()
	{
		final DockerClient dockerClient = this.manager.getDockerClient();
		final String execId = dockerClient
			.execCreateCmd(this.manager.getContainerId())
			.withCmd("inotifywatch", "--monitor", "--recursive", "--quiet", //
			         "--event", "modify", //
			         "--event", "move", //
			         "--event", "create", //
			         "--event", "delete", //
			         this.manager.getProjectDir())
			.withAttachStdout(true)
			.exec()
			.getId();
		// dockerClient.execStartCmd(execId).exec();
	}
}
