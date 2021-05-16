package org.fulib.webapp.projects.container;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerCmd;
import com.github.dockerjava.api.exception.NotFoundException;
import com.github.dockerjava.api.exception.NotModifiedException;
import com.github.dockerjava.api.model.Bind;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import org.fulib.webapp.projects.model.Container;
import org.fulib.webapp.projects.model.Project;

import javax.inject.Inject;
import java.io.File;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DockerContainerProvider
{
	private static final String BIND_PREFIX = new File("data").getAbsolutePath();
	private static final String PROJECTS_DIR = "/projects/";
	private static final String CONTAINER_IMAGE = System.getenv("FULIB_PROJECTS_CONTAINER_IMAGE");
	private static final String API_HOST = System.getenv("FULIB_PROJECTS_URL");
	private static final String PROXY_HOST = System.getenv("FULIB_PROJECTS_PROXY_URL");
	private static final String NETWORK_NAME = "fulib-projects";

	private final DockerClient dockerClient;

	@Inject
	public DockerContainerProvider()
	{
		final DockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder().build();
		final DockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
			.dockerHost(config.getDockerHost())
			.sslConfig(config.getSSLConfig())
			.build();
		dockerClient = DockerClientImpl.getInstance(config, httpClient);
	}

	public Container find(Project project)
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
		return result;
	}

	public Container start(Project project)
	{
		final String id = project.getId();

		final Map<String, String> labels = new HashMap<>();
		labels.put("org.fulib.project", id);

		final CreateContainerCmd cmd = dockerClient
			.createContainerCmd(CONTAINER_IMAGE)
			.withTty(true)
			.withNetworkMode(NETWORK_NAME)
			.withEnv("PROJECT_ID=" + id)
			.withLabels(labels);

		if (!project.isLocal())
		{
			cmd.withBinds(Bind.parse(BIND_PREFIX + PROJECTS_DIR + id + ':' + PROJECTS_DIR + id));
		}

		final String containerId = cmd.exec().getId();
		dockerClient.startContainerCmd(containerId).exec();

		final Container container = new Container();
		container.setId(containerId);
		container.setProjectId(id);
		container.setUrl(getContainerUrl(containerId));
		return container;
	}

	private String getContainerUrl(String containerId)
	{
		return PROXY_HOST + "/containers/" + containerId.substring(0, 12);
	}

	public void copyFilesToContainer(Container container, InputStream tarInputStream)
	{
		dockerClient
			.copyArchiveToContainerCmd(container.getId())
			.withRemotePath(PROJECTS_DIR + container.getProjectId() + "/")
			.withTarInputStream(tarInputStream)
			.exec();
	}

	public void stop(Container container)
	{
		this.kill(container);
	}

	public void kill(Container container)
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
}
