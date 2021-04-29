package org.fulib.webapp.projects.tool;

import java.security.SecureRandom;
import java.util.UUID;

public class IDGenerator
{
	public static String generateID()
	{
		return UUID.randomUUID().toString();
	}
}
