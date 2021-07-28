package org.fulib.webapp.projects.projects;

import org.fulib.webapp.projects.containers.DockerContainerProvider;
import org.fulib.webapp.projects.containers.Container;
import org.fulib.webapp.projects.members.Member;
import org.fulib.webapp.projects.members.MemberRepository;

import javax.inject.Inject;
import java.io.IOException;
import java.util.List;

public class ProjectService
{
	@Inject
	ProjectRepository projectRepository;
	@Inject
	DockerContainerProvider dockerContainerProvider;
	@Inject
	ProjectGenerator projectGenerator;
	@Inject
	MemberRepository memberRepository;

	@Inject
	public ProjectService()
	{
	}

	public Project find(String id)
	{
		return this.projectRepository.find(id);
	}

	public List<Project> findByUser(String user)
	{
		return this.projectRepository.findByUser(user);
	}

	public void create(Project project) throws IOException
	{
		this.projectRepository.create(project);
		final Member owner = new Member();
		owner.setProjectId(project.getId());
		owner.setUserId(project.getUserId());
		memberRepository.create(owner);
	}

	public void update(Project project)
	{
		this.projectRepository.update(project);
	}

	public void delete(Project project)
	{
		final Container container = this.dockerContainerProvider.find(project.getId());
		if (container != null)
		{
			this.dockerContainerProvider.kill(container);
		}

		memberRepository.deleteByProject(project.getId());

		this.dockerContainerProvider.delete(project);
		this.projectRepository.delete(project.getId());
	}
}
