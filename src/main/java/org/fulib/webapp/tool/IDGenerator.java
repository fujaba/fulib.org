package org.fulib.webapp.tool;

import java.security.SecureRandom;
import java.util.UUID;

public class IDGenerator
{
	public static String generateID()
	{
		return UUID.randomUUID().toString();
	}

	public static String generateToken()
	{
		final SecureRandom random = new SecureRandom();
		final long value = random.nextLong();
		final String base16 = String.format("%016x", value);
		return base16.replaceAll("(.{4})(.{4})(.{4})(.{4})", "$1-$2-$3-$4");
	}
}
