package org.fulib.webapp.projects.docker;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.async.ResultCallback;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import org.apache.commons.compress.archivers.ArchiveOutputStream;
import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveOutputStream;
import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.projects.FileWalker;
import org.fulib.webapp.projects.model.File;
import org.fulib.webapp.projects.model.Project;
import org.fulib.webapp.projects.model.Revision;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ForkJoinPool;

public class ContainerManager
{
	private final Mongo mongo;
	private final Project project;

	private DockerClient dockerClient;
	private String containerId;

	private List<ContainerProcess> processes = new ArrayList<>();

	public ContainerManager(Mongo mongo, Project project)
	{
		this.mongo = mongo;
		this.project = project;
	}

	public Project getProject()
	{
		return project;
	}

	public DockerClient getDockerClient()
	{
		return dockerClient;
	}

	public String getContainerId()
	{
		return containerId;
	}

	public String getProjectDir()
	{
		return "/projects/" + project.getId() + "/";
	}

	public void start()
	{
		final DockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder().build();
		final DockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
			.dockerHost(config.getDockerHost())
			.sslConfig(config.getSSLConfig())
			.build();
		dockerClient = DockerClientImpl.getInstance(config, httpClient);

		containerId = this.runContainer(dockerClient);

		try
		{
			this.copyFiles(project, getProjectDir(), dockerClient, containerId);
		}
		catch (InterruptedException ignored)
		{
		}
	}

	private String runContainer(DockerClient dockerClient)
	{
		final String id = dockerClient.createContainerCmd("fulib/projects").withTty(true).exec().getId();
		dockerClient.startContainerCmd(id).exec();
		return id;
	}

	private void createProjectDir(DockerClient dockerClient, String containerId, String projectDir)
		throws InterruptedException
	{
		final String mkdirExecId = dockerClient
			.execCreateCmd(containerId)
			.withCmd("mkdir", "-p", projectDir)
			.exec()
			.getId();

		dockerClient.execStartCmd(mkdirExecId).exec(new ResultCallback.Adapter<>()).awaitCompletion();
	}

	private void copyFiles(Project project, String projectDir, DockerClient dockerClient, String containerId)
		throws InterruptedException
	{
		this.createProjectDir(dockerClient, containerId, projectDir);

		try (final PipedInputStream pipeInput = new PipedInputStream();
		     final PipedOutputStream pipeOutput = new PipedOutputStream(pipeInput))
		{
			ForkJoinPool.commonPool().execute(() -> {
				try (final TarArchiveOutputStream output = new TarArchiveOutputStream(pipeOutput))
				{
					this.copyFiles(project, output);
				}
				catch (IOException e)
				{
					// TODO
					e.printStackTrace();
				}
			});
			dockerClient
				.copyArchiveToContainerCmd(containerId)
				.withRemotePath(projectDir)
				.withTarInputStream(pipeInput)
				.exec();
		}
		catch (IOException e)
		{
			// TODO
			e.printStackTrace();
		}
	}

	private void copyFiles(Project project, ArchiveOutputStream output)
	{
		new FileWalker(this.mongo).walk(project.getRootFileId(), (file, path) -> {
			if (file.isDirectory())
			{
				return;
			}

			this.copyFile(file, path, output);
		});
	}

	private void copyFile(File file, String path, ArchiveOutputStream output)
	{
		final List<Revision> revisions = file.getRevisions();
		final Revision newestRevision = revisions.get(revisions.size() - 1);

		try
		{
			final TarArchiveEntry entry = new TarArchiveEntry(path);
			entry.setModTime(newestRevision.getTimestamp().toEpochMilli());
			entry.setSize(newestRevision.getSize());
			output.putArchiveEntry(entry);
			this.mongo.downloadRevision(newestRevision.getId(), output);
			output.closeArchiveEntry();
		}
		catch (IOException e)
		{
			// TODO
			e.printStackTrace();
		}
	}

	public String exec(String[] cmd, InputStream input, OutputStream output)
	{
		return this.exec(new ContainerProcess(this, cmd, input, output));
	}

	public String exec(ContainerProcess process)
	{
		this.processes.add(process);
		return process.start();
	}

	public void stop()
	{
		this.processes.forEach(ContainerProcess::stop);

		this.dockerClient.stopContainerCmd(this.containerId).exec();
		this.dockerClient.removeContainerCmd(this.containerId).exec();
		try
		{
			this.dockerClient.close();
		}
		catch (IOException ex)
		{
			// TODO
			ex.printStackTrace();
		}
	}
}
