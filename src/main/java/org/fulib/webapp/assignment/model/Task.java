package org.fulib.webapp.assignment.model;

public class Task
{
	// =============== Fields ===============

	private String description;
	private int points;
	private String verification;

	// =============== Properties ===============

	public String getDescription()
	{
		return this.description;
	}

	public void setDescription(String description)
	{
		this.description = description;
	}

	public int getPoints()
	{
		return this.points;
	}

	public void setPoints(int points)
	{
		this.points = points;
	}

	public String getVerification()
	{
		return this.verification;
	}

	public void setVerification(String verification)
	{
		this.verification = verification;
	}
}
