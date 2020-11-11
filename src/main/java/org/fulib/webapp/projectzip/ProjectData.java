package org.fulib.webapp.projectzip;

public class ProjectData
{
	// =============== Constants ===============

	public static final String PROPERTY_PACKAGE_NAME = "packageName";
	public static final String PROPERTY_SCENARIO_FILE_NAME = "scenarioFileName";
	public static final String PROPERTY_PROJECT_NAME = "projectName";
	public static final String PROPERTY_PROJECT_VERSION = "projectVersion";
	public static final String PROPERTY_SCENARIO_TEXT = "scenarioText";
	public static final String PROPERTY_DECORATOR_CLASS_NAME = "decoratorClassName";

	// =============== Fields ===============

	private String packageName;
	private String scenarioFileName;
	private String projectName;
	private String projectVersion;
	private String scenarioText;
	private String decoratorClassName;

	// =============== Properties ===============

	public String getPackageName()
	{
		return packageName;
	}

	public void setPackageName(String packageName)
	{
		this.packageName = packageName;
	}

	public String getScenarioFileName()
	{
		return scenarioFileName;
	}

	public void setScenarioFileName(String scenarioFileName)
	{
		this.scenarioFileName = scenarioFileName;
	}

	public String getProjectName()
	{
		return projectName;
	}

	public void setProjectName(String projectName)
	{
		this.projectName = projectName;
	}

	public String getProjectVersion()
	{
		return projectVersion;
	}

	public void setProjectVersion(String projectVersion)
	{
		this.projectVersion = projectVersion;
	}

	public String getScenarioText()
	{
		return scenarioText;
	}

	public void setScenarioText(String scenarioText)
	{
		this.scenarioText = scenarioText;
	}

	public String getDecoratorClassName()
	{
		return decoratorClassName;
	}

	public void setDecoratorClassName(String decoratorClassName)
	{
		this.decoratorClassName = decoratorClassName;
	}
}
