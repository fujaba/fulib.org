package org.fulib.webapp.projects.members;

public class Member
{
	public static final String PROPERTY_PROJECT_ID = "project";
	public static final String PROPERTY_USER_ID = "userId";

	private String projectId;
	private String userId;

	// TODO role...

	public String getProjectId()
	{
		return projectId;
	}

	public void setProjectId(String projectId)
	{
		this.projectId = projectId;
	}

	public String getUserId()
	{
		return userId;
	}

	public void setUserId(String userId)
	{
		this.userId = userId;
	}
}
