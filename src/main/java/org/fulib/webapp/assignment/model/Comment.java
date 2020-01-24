package org.fulib.webapp.assignment.model;

import java.time.Instant;

public class Comment
{
	// =============== Constants ===============

	public static final String PROPERTY_id = "id";
	public static final String PROPERTY_parent = "parent";
	public static final String PROPERTY_author = "author";
	public static final String PROPERTY_email = "email";
	public static final String PROPERTY_timeStamp = "timeStamp";
	public static final String PROPERTY_markdown = "markdown";
	public static final String PROPERTY_html = "html";

	// =============== Fields ===============

	private final String id;

	private String parent;

	private Instant timeStamp;

	private String author;
	private String email;

	private String markdown;
	private String html;

	// =============== Constructors ===============

	public Comment(String id)
	{
		this.id = id;
	}

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
}
