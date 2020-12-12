package org.fulib.webapp.projects;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.async.ResultCallback;
import com.github.dockerjava.api.model.Frame;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import org.apache.commons.compress.archivers.ArchiveOutputStream;
import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveOutputStream;
import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.projects.model.File;
import org.fulib.webapp.projects.model.Project;
import org.fulib.webapp.projects.model.Revision;

import java.io.*;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.ForkJoinPool;

public class Executor
{
	private final Mongo mongo;

	public Executor(Mongo mongo)
	{
		this.mongo = mongo;
	}

	public void execute(Project project, String[] command, InputStream input, OutputStream output)
	{
		final String projectDir = "/projects/" + project.getId() + "/";

		final DockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder().build();
		final DockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
			.dockerHost(config.getDockerHost())
			.sslConfig(config.getSSLConfig())
			.build();
		final DockerClient dockerClient = DockerClientImpl.getInstance(config, httpClient);

		final String containerId = this.runContainer(dockerClient);

		this.copyFiles(project, projectDir, dockerClient, containerId);

		final ResultCallback.Adapter<Frame> outputAdapter = new ResultCallback.Adapter<Frame>()
		{
			@Override
			public void onNext(Frame object)
			{
				try
				{
					output.write(object.getPayload());
				}
				catch (IOException e)
				{
					// TODO
					e.printStackTrace();
				}
			}
		};

		final String execId = dockerClient
			.execCreateCmd(containerId)
			.withTty(true)
			.withAttachStdout(true)
			.withAttachStderr(true)
			.withAttachStdin(true)
			.withWorkingDir(projectDir)
			.withCmd(command)
			.exec()
			.getId();

		try
		{
			dockerClient.execStartCmd(execId).withTty(true).withStdIn(input).exec(outputAdapter).awaitCompletion();
		}
		catch (InterruptedException e)
		{
			e.printStackTrace();
		}
	}

	private String runContainer(DockerClient dockerClient)
	{
		// TODO custom image
		final String id = dockerClient.createContainerCmd("openjdk:8-jdk-slim").withTty(true).exec().getId();
		dockerClient.startContainerCmd(id).exec();
		return id;
	}

	private void createProjectDir(DockerClient dockerClient, String containerId, String projectDir)
	{
		final String mkdirExecId = dockerClient
			.execCreateCmd(containerId)
			.withCmd("mkdir", "-p", projectDir)
			.exec()
			.getId();
		dockerClient.execStartCmd(mkdirExecId).exec(new ResultCallback.Adapter<>());
	}

	private void copyFiles(Project project, String projectDir, DockerClient dockerClient, String containerId)
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
			this.mongo.downloadFile(file.getId(), -1, output);
			output.closeArchiveEntry();
		}
		catch (IOException e)
		{
			// TODO
			e.printStackTrace();
		}
	}
}
