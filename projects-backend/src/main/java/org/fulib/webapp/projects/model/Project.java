package org.fulib.webapp.projects.model;

import org.bson.BsonType;
import org.bson.codecs.pojo.annotations.BsonRepresentation;

import java.time.Instant;

public class Project
{
	// =============== Constants ===============

	public static final String PROPERTY_ID = "id";
	public static final String PROPERTY_USER_ID = "userId";

	public static final String PROPERTY_NAME = "name";
	public static final String PROPERTY_DESCRIPTION = "description";
	public static final String PROPERTY_CREATED = "created";

	// =============== Fields ===============

	private String id;
	private String userId;

	private String name;
	private String description;
	private Instant created;

	// =============== Properties ===============

	@BsonRepresentation(BsonType.OBJECT_ID)
	public String getId()
	{
		return id;
	}

	public void setId(String id)
	{
		this.id = id;
	}

	public String getUserId()
	{
		return userId;
	}

	public void setUserId(String userId)
	{
		this.userId = userId;
	}

	public String getName()
	{
		return name;
	}

	public void setName(String name)
	{
		this.name = name;
	}

	public String getDescription()
	{
		return description;
	}

	public void setDescription(String description)
	{
		this.description = description;
	}

	public Instant getCreated()
	{
		return created;
	}

	public void setCreated(Instant created)
	{
		this.created = created;
	}
}
