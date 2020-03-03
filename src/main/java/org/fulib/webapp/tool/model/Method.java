package org.fulib.webapp.tool.model;

public class Method
{
	// =============== Constants ===============

	public static final String PROPERTY_className = "className";
	public static final String PROPERTY_name = "name";
	public static final String PROPERTY_body = "body";

	// =============== Fields ===============

	private String className;
	private String name;
	private String body;

	// =============== Properties ===============

	public String getClassName()
	{
		return this.className;
	}

	public void setClassName(String className)
	{
		this.className = className;
	}

	public String getName()
	{
		return this.name;
	}

	public void setName(String name)
	{
		this.name = name;
	}

	public String getBody()
	{
		return this.body;
	}

	public void setBody(String body)
	{
		this.body = body;
	}
}
