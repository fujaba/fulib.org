package org.fulib.webapp.projects.docker;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.async.ResultCallback;
import com.github.dockerjava.api.command.CreateContainerCmd;
import com.github.dockerjava.api.exception.NotFoundException;
import com.github.dockerjava.api.exception.NotModifiedException;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import com.mongodb.MongoGridFSException;
import org.apache.commons.io.IOUtils;
import org.fulib.webapp.projects.mongo.Mongo;
import org.fulib.webapp.projects.model.Container;
import org.fulib.webapp.projects.model.Project;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.UUID;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

public class ContainerManager
{
	private static final String PROJECTS_DIR = "/projects/";

	private final Mongo mongo;

	private final DockerClient dockerClient;

	public ContainerManager(Mongo mongo)
	{
		this.mongo = mongo;

		final DockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder().build();
		final DockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
			.dockerHost(config.getDockerHost())
			.sslConfig(config.getSSLConfig())
			.build();
		dockerClient = DockerClientImpl.getInstance(config, httpClient);
	}

	public Container start(Project project)
	{
		final Container container = this.runContainer(project);
		this.downloadFilesToContainer(container);
		return container;
	}

	private Container runContainer(Project project)
	{
		final String stopToken = UUID.randomUUID().toString();
		final String apiHost = System.getenv("FULIB_PROJECTS_URL");
		final String stopUrl =
			apiHost + "/api/projects/" + project.getId() + "/container?stopToken=" + stopToken;

		final CreateContainerCmd cmd = dockerClient
			.createContainerCmd("fulib/projects")
			.withTty(true)
			.withNetworkMode("fulib-projects")
			.withEnv("STOP_URL=" + stopUrl);

		final String containerId = cmd.exec().getId();
		dockerClient.startContainerCmd(containerId).exec();

		final String proxyHost = System.getenv("FULIB_PROJECTS_PROXY_URL");
		final String containerAddress = proxyHost + "/containers/" + containerId.substring(0, 12);

		final Container container = new Container();
		container.setId(containerId);
		container.setProjectId(project.getId());
		container.setUrl(containerAddress);
		container.setStopToken(stopToken);
		return container;
	}

	private void createProjectDir(Container container)
	{
		final String mkdirExecId = dockerClient
			.execCreateCmd(container.getId())
			.withCmd("mkdir", "-p", PROJECTS_DIR + container.getProjectId())
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

	private void downloadFilesToContainer(Container container)
	{
		this.createProjectDir(container);

		try (
			final InputStream downloadStream = this.mongo.downloadFile(container.getProjectId());
			final GZIPInputStream gzipInputStream = new GZIPInputStream(downloadStream)
		)
		{
			dockerClient
				.copyArchiveToContainerCmd(container.getId())
				.withRemotePath(PROJECTS_DIR + container.getProjectId() + "/")
				.withTarInputStream(gzipInputStream)
				.exec();
		}
		catch (MongoGridFSException | IOException e)
		{
			// TODO
			e.printStackTrace();
		}
	}

	public void stop(Container container)
	{
		try
		{
			this.dockerClient.stopContainerCmd(container.getId()).exec();
		}
		catch (NotFoundException ignored)
		{
			return;
		}
		catch (NotModifiedException ignored)
		{
		}

		try
		{
			this.dockerClient.removeContainerCmd(container.getId()).exec();
		}
		catch (NotFoundException ignored)
		{
		}
	}

	public void uploadFilesFromContainer(Container container)
	{
		final String projectId = container.getProjectId();
		try (
			final InputStream tarInputStream = dockerClient
				.copyArchiveFromContainerCmd(container.getId(), PROJECTS_DIR + projectId + "/.")
				.exec();
			final OutputStream uploadStream = this.mongo.uploadFile(projectId);
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
