package org.fulib.webapp.assignment.model;

import org.bson.codecs.pojo.annotations.BsonCreator;
import org.bson.codecs.pojo.annotations.BsonProperty;

import java.time.Instant;

public class Comment
{
	// =============== Constants ===============

	public static final String PROPERTY_id = "id";
	public static final String PROPERTY_parent = "parent";
	public static final String PROPERTY_timeStamp = "timeStamp";
	public static final String PROPERTY_userId = "userId";
	public static final String PROPERTY_author = "author";
	public static final String PROPERTY_email = "email";
	public static final String PROPERTY_markdown = "markdown";
	public static final String PROPERTY_html = "html";
	public static final String PROPERTY_distinguished = "distinguished";

	// =============== Fields ===============

	private final String id;

	private String parent;

	private Instant timeStamp;

	private String userId;
	private String author;
	private String email;

	private String markdown;
	private String html;

	private boolean distinguished;

	// =============== Constructors ===============

	@BsonCreator
	public Comment(@BsonProperty(PROPERTY_id) String id)
	{
		this.id = id;
	}

	@BsonProperty(PROPERTY_id)
	public String getID()
	{
		return this.id;
	}

	public String getParent()
	{
		return this.parent;
	}

	public void setParent(String parent)
	{
		this.parent = parent;
	}

	public Instant getTimeStamp()
	{
		return this.timeStamp;
	}

	public void setTimeStamp(Instant timeStamp)
	{
		this.timeStamp = timeStamp;
	}

	public String getUserId()
	{
		return userId;
	}

	public void setUserId(String userId)
	{
		this.userId = userId;
	}

	public String getAuthor()
	{
		return this.author;
	}

	public void setAuthor(String author)
	{
		this.author = author;
	}

	public String getEmail()
	{
		return this.email;
	}

	public void setEmail(String email)
	{
		this.email = email;
	}

	public String getMarkdown()
	{
		return this.markdown;
	}

	public void setMarkdown(String markdown)
	{
		this.markdown = markdown;
	}

	public String getHtml()
	{
		return this.html;
	}

	public void setHtml(String html)
	{
		this.html = html;
	}

	public boolean isDistinguished()
	{
		return this.distinguished;
	}

	public void setDistinguished(boolean distinguished)
	{
		this.distinguished = distinguished;
	}
}
