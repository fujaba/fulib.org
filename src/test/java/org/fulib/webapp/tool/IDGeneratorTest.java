package org.fulib.webapp.tool;

import org.junit.Test;

import java.util.UUID;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;

public class IDGeneratorTest
{
	@Test
	public void generateID()
	{
		final String id = IDGenerator.generateID();
		final UUID uuid = UUID.fromString(id);
		assertThat(uuid.version(), equalTo(4));
	}

	@Test
	public void generateToken()
	{
		final String token = IDGenerator.generateToken();
		assertThat(token.matches("[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}"), equalTo(true));
	}
}
