package org.fulib.webapp.projects.model;

public class Container
{
	public static final String PROPERTY_ID = "id";
	public static final String PROPERTY_URL = "url";
	public static final String PROPERTY_PROJECT_ID = "projectId";

	private String id;
	private String url;
	private String projectId;

	public String getId()
	{
		return id;
	}

	public void setId(String id)
	{
		this.id = id;
	}

	public String getUrl()
	{
		return url;
	}

	public void setUrl(String url)
	{
		this.url = url;
	}

	public String getProjectId()
	{
		return projectId;
	}

	public void setProjectId(String projectId)
	{
		this.projectId = projectId;
	}
}
