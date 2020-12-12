package org.fulib.webapp.tool.model;

public class Diagram
{
	// =============== Constants ===============

	public static final String PROPERTY_path = "path";
	public static final String PROPERTY_name = "name";
	public static final String PROPERTY_content = "content";

	// =============== Fields ===============

	private String path;
	private String name;
	private String content;

	// =============== Properties ===============

	public String getPath()
	{
		return this.path;
	}

	public void setPath(String path)
	{
		this.path = path;
	}

	public String getName()
	{
		return this.name;
	}

	public void setName(String name)
	{
		this.name = name;
	}

	public String getContent()
	{
		return this.content;
	}

	public void setContent(String content)
	{
		this.content = content;
	}
}
