package org.fulib.webapp.projects.model;

import org.bson.codecs.pojo.annotations.BsonProperty;

public class Container
{
	public static final String PROPERTY_ID = "id";
	public static final String PROPERTY_URL = "url";
	public static final String PROPERTY_PROJECT_ID = "projectId";
	public static final String PROPERTY_STOP_TOKEN = "stopToken";

	private String id;
	private String url;
	private String projectId;

	private String stopToken;

	@BsonProperty
	public String getId()
	{
		return id;
	}

	@BsonProperty
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

	public String getStopToken()
	{
		return stopToken;
	}

	public void setStopToken(String stopToken)
	{
		this.stopToken = stopToken;
	}
}
