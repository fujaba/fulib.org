package org.fulib.webapp.projects.model;

import org.bson.codecs.pojo.annotations.BsonCreator;
import org.bson.codecs.pojo.annotations.BsonProperty;

import java.time.Instant;

public class Revision
{
	// =============== Constants ===============

	public static final String PROPERTY_ID = "id";
	public static final String PROPERTY_TIMESTAMP = "timestamp";
	public static final String PROPERTY_SIZE = "size";

	// =============== Fields ===============

	private final String id;
	private Instant timestamp;
	private long size;

	public Revision(String id)
	{
		this.id = id;
	}

	public String getId()
	{
		return id;
	}

	public Instant getTimestamp()
	{
		return timestamp;
	}

	public void setTimestamp(Instant timestamp)
	{
		this.timestamp = timestamp;
	}

	public long getSize()
	{
		return size;
	}

	public void setSize(long size)
	{
		this.size = size;
	}
}
