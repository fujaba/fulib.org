package org.fulib.webapp.projects.members;

import org.fulib.webapp.projects.projects.Project;
import org.fulib.webapp.projects.projects.ProjectController;
import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import javax.inject.Inject;

import static spark.Spark.halt;

public class MemberController
{
	private final ProjectController projectController;
	private final MemberRepository memberRepository;

	@Inject
	public MemberController(ProjectController projectController, MemberRepository memberRepository)
	{
		this.projectController = projectController;
		this.memberRepository = memberRepository;
	}

	public Object getAll(Request request, Response response)
	{
		final String id = getAndCheckProjectId(request);

		return new JSONArray(memberRepository.findByProject(id)).toString();
	}

	public Object updateOne(Request request, Response response)
	{
		final String id = getAndCheckProjectId(request);
		final String userId = request.params("userId");

		final Member member = new Member();
		member.setProjectId(id);
		member.setUserId(userId);
		memberRepository.create(member);

		return new JSONArray(member).toString();
	}

	public Object getOne(Request request, Response response)
	{
		final String id = getAndCheckProjectId(request);
		final String userId = request.params("userId");

		final Member member = memberRepository.findOne(id, userId);
		if (member == null)
		{
			// language=JSON
			throw halt(404, "{" + "\"error\":" + " \"member not found\"" + "}");
		}

		return new JSONObject(member).toString();
	}

	public Object deleteOne(Request request, Response response)
	{
		final String id = getAndCheckProjectId(request);
		final String userId = request.params("userId");

		final Member member = memberRepository.deleteOne(id, userId);
		if (member == null)
		{
			// language=JSON
			throw halt(404, "{" + "\"error\":" + " \"member not found\"" + "}");
		}

		return new JSONObject(member).toString();
	}

	private String getAndCheckProjectId(Request request)
	{
		final String id = request.params("id");
		final Project project = projectController.getOr404(id);
		projectController.checkAuth(request, project);
		return id;
	}
}
