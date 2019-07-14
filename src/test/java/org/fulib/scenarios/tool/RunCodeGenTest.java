package org.fulib.scenarios.tool;

import org.fulib.StrUtil;
import org.junit.Test;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class RunCodeGenTest
{

	@Test
	public void shouldSkip()
	{
		final Set<String> properties = new HashSet<>(Arrays.asList("foo", "bar", "baz"));

		for (final String defaultMethod : RunCodeGen.DEFAULT_METHODS)
		{
			final String decl = "* " + defaultMethod + "()";
			assertTrue("should skip " + decl, RunCodeGen.shouldSkip(decl, properties));
		}

		for (final String defaultMethod : RunCodeGen.DEFAULT_PROPERTY_METHODS)
		{
			for (final String property : properties)
			{
				final String decl = "* " + defaultMethod + StrUtil.cap(property) + "()";
				assertTrue("should skip " + decl, RunCodeGen.shouldSkip(decl, properties));
			}
		}

		final String[] decls = { "* prepareFoo()", "* addFoo()", "* getMoo()", "* setMoo()", "* withMoos()",
			"* withoutMoos()" };
		for (final String decl : decls)
		{
			assertFalse("should not skip " + decl, RunCodeGen.shouldSkip(decl, properties));
		}
	}
}
