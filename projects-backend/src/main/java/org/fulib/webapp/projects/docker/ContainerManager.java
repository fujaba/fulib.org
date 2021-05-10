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
import org.fulib.webapp.projects.db.FileRepository;
import org.fulib.webapp.projects.model.Container;
import org.fulib.webapp.projects.model.Project;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.*;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

public class ContainerManager
{
	private static final String PROJECTS_DIR = "/projects/";
	private static final String CONTAINER_IMAGE = System.getenv("FULIB_PROJECTS_CONTAINER_IMAGE");
	private static final String API_HOST = System.getenv("FULIB_PROJECTS_URL");
	private static final String PROXY_HOST = System.getenv("FULIB_PROJECTS_PROXY_URL");
	private static final String NETWORK_NAME = "fulib-projects";

	private final FileRepository fileRepository;

	private final DockerClient dockerClient;

	public ContainerManager(FileRepository fileRepository)
	{
		this.fileRepository = fileRepository;

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

	public Container getContainer(Project project)
	{
		final String projectId = project.getId();
		final List<com.github.dockerjava.api.model.Container> containers = dockerClient
			.listContainersCmd()
			.withLabelFilter(Collections.singletonMap("org.fulib.project", projectId))
			.exec();
		if (containers.isEmpty())
		{
			return null;
		}

		final com.github.dockerjava.api.model.Container dockerContainer = containers.get(0);
		final String containerId = dockerContainer.getId();

		final Container result = new Container();
		result.setId(containerId);
		result.setProjectId(projectId);
		result.setUrl(getContainerUrl(containerId));
		result.setStopToken(dockerContainer.getLabels().get("org.fulib.stopToken"));
		return result;
	}

	private Container runContainer(Project project)
	{
		final String stopToken = UUID.randomUUID().toString();
		final String stopUrl =
			API_HOST + "/api/projects/" + project.getId() + "/container?stopToken=" + stopToken;

		final Map<String, String> labels = new HashMap<>();
		labels.put("org.fulib.project", project.getId());
		labels.put("org.fulib.stopToken", stopToken);

		final CreateContainerCmd cmd = dockerClient
			.createContainerCmd(CONTAINER_IMAGE)
			.withTty(true)
			.withNetworkMode(NETWORK_NAME)
			.withLabels(labels)
			.withEnv("STOP_URL=" + stopUrl);

		final String containerId = cmd.exec().getId();
		dockerClient.startContainerCmd(containerId).exec();

		final Container container = new Container();
		container.setId(containerId);
		container.setProjectId(project.getId());
		container.setUrl(getContainerUrl(containerId));
		container.setStopToken(stopToken);
		return container;
	}

	private String getContainerUrl(String containerId)
	{
		return PROXY_HOST + "/containers/" + containerId.substring(0, 12);
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
			final InputStream downloadStream = this.fileRepository.download(container.getProjectId());
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
			final OutputStream uploadStream = this.fileRepository.upload(projectId);
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
