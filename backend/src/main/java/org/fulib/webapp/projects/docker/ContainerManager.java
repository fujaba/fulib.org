package org.fulib.webapp.projects.docker;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.async.ResultCallback;
import com.github.dockerjava.api.command.CreateContainerCmd;
import com.github.dockerjava.api.command.InspectContainerResponse;
import com.github.dockerjava.api.model.ExposedPort;
import com.github.dockerjava.api.model.NetworkSettings;
import com.github.dockerjava.api.model.Ports;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import com.mongodb.MongoGridFSException;
import org.apache.commons.io.IOUtils;
import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.projects.model.Project;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Locale;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

public class ContainerManager
{
	private static final String PROJECTS_DIR = "/projects/";

	private final Mongo mongo;
	private final Project project;

	private DockerClient dockerClient;
	private String containerId;
	private String containerAddress;

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

	public String getContainerAddress()
	{
		return containerAddress;
	}

	public String getProjectDir()
	{
		return PROJECTS_DIR + project.getId() + "/";
	}

	public void start()
	{
		final DockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder().build();
		final DockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
			.dockerHost(config.getDockerHost())
			.sslConfig(config.getSSLConfig())
			.build();
		dockerClient = DockerClientImpl.getInstance(config, httpClient);

		this.runContainer();

		this.downloadFilesToContainer();
	}

	private void runContainer()
	{
		final CreateContainerCmd cmd = dockerClient
			.createContainerCmd("fulib/projects")
			.withTty(true);

		final boolean linux = System.getProperty("os.name", "generic").toUpperCase(Locale.ROOT).contains("NUX");
		if (!linux)
		{
			cmd.withPublishAllPorts(true);
		}

		containerId = cmd
			.exec()
			.getId();
		dockerClient.startContainerCmd(containerId).exec();

		final InspectContainerResponse inspectResponse = dockerClient.inspectContainerCmd(containerId).exec();
		final NetworkSettings networkSettings = inspectResponse.getNetworkSettings();
		if (linux)
		{
			containerAddress = networkSettings.getIpAddress();
		}
		else
		{
			final Ports.Binding[] bindings = networkSettings.getPorts().getBindings().get(ExposedPort.tcp(80));
			if (bindings != null && bindings.length > 0)
			{
				final Ports.Binding binding = bindings[0];
				containerAddress = binding.getHostIp() + ":" + binding.getHostPortSpec();
			}
			else
			{
				containerAddress = null;
			}
		}
	}

	private void createProjectDir()
	{
		final String mkdirExecId = dockerClient
			.execCreateCmd(containerId)
			.withCmd("mkdir", "-p", getProjectDir())
			.exec()
			.getId();

		try
		{
			dockerClient.execStartCmd(mkdirExecId).exec(new ResultCallback.Adapter<>()).awaitCompletion();
		}
		catch (InterruptedException ex)
		{
			// TODO
			ex.printStackTrace();
		}
	}

	private void downloadFilesToContainer()
	{
		this.createProjectDir();

		try (
			final InputStream downloadStream = this.mongo.downloadFile(project.getId());
			final GZIPInputStream gzipInputStream = new GZIPInputStream(downloadStream)
		)
		{
			dockerClient
				.copyArchiveToContainerCmd(containerId)
				.withRemotePath(getProjectDir())
				.withTarInputStream(gzipInputStream)
				.exec();
		}
		catch (MongoGridFSException | IOException e)
		{
			// TODO
			e.printStackTrace();
		}
	}

	public void stop()
	{
		this.uploadFilesFromContainer();

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

	private void uploadFilesFromContainer()
	{
		try (
			final InputStream tarInputStream = dockerClient
				.copyArchiveFromContainerCmd(containerId, getProjectDir() + ".")
				.exec();
			final OutputStream uploadStream = this.mongo.uploadFile(project.getId());
			final GZIPOutputStream gzipOutputStream = new GZIPOutputStream(uploadStream)
		)
		{
			IOUtils.copy(tarInputStream, gzipOutputStream);
		}
		catch (IOException e)
		{
			// TODO
			e.printStackTrace();
		}
	}
}
