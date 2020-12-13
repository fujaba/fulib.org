package org.fulib.webapp.tool.model;

public class CodeGenData
{
	// =============== Constants ===============

	public static final String PROPERTY_scenarioText = "scenarioText";
	public static final String PROPERTY_packageName = "packageName";
	public static final String PROPERTY_scenarioFileName = "scenarioFileName";

	// =============== Constants ===============

	private String scenarioText;
	private String packageName;
	private String scenarioFileName;

	// =============== Properties ===============

	public String getScenarioText()
	{
		return this.scenarioText;
	}

	public void setScenarioText(String scenarioText)
	{
		this.scenarioText = scenarioText;
	}

	public String getPackageName()
	{
		return this.packageName;
	}

	public void setPackageName(String packageName)
	{
		this.packageName = packageName;
	}

	public String getScenarioFileName()
	{
		return this.scenarioFileName;
	}

	public void setScenarioFileName(String scenarioFileName)
	{
		this.scenarioFileName = scenarioFileName;
	}
}
