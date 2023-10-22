package org.fulib.webapp.tool;

import org.fulib.StrUtil;
import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.tool.model.Result;
import org.hamcrest.CoreMatchers;
import org.json.JSONObject;
import org.junit.Test;
import spark.Request;
import spark.Response;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.*;

public class RunCodeGenTest
{
	private static final String PNG_HEADER_BASE64 = "iVBORw0KGgo";

	@Test
	public void handle() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final RunCodeGen codeGen = new RunCodeGen(db);

		final Request request = mock(Request.class);
		final String ip = "0.0.0.0";
		final String userAgent = "test/1.0";
		// language=JSON
		final String requestBody = "{\n" + "  \"scenarioText\": \"# Test\\n\\nThere is a Student with name Alice.\\n\\n![alice](alice.png)\",\n"
		                     + "  \"packageName\": \"org.example\",\n" + "  \"scenarioFileName\": \"Scenario.md\",\n"
		                           + "  \"privacy\": \"all\"\n"
		                     + "}";
		when(request.ip()).thenReturn(ip);
		when(request.userAgent()).thenReturn(userAgent);
		when(request.body()).thenReturn(requestBody);

		final Response response = mock(Response.class);

		final String responseBody = codeGen.handle(request, response);

		verify(response).type("application/json");
		verify(db).log(ip, userAgent, requestBody, responseBody);

		final JSONObject responseObj = new JSONObject(responseBody);
		assertThat(responseObj.getString("output"), equalTo(""));
		assertThat(responseObj.getInt("exitCode"), equalTo(0));
		assertThat(responseObj.getString("classDiagram"), CoreMatchers.startsWith("<svg"));

		final JSONObject objectDiagram0 = responseObj.getJSONArray("objectDiagrams").getJSONObject(0);
		assertThat(objectDiagram0.getString("name"), equalTo("alice.png"));
		assertThat(objectDiagram0.getString("content"), CoreMatchers.startsWith(PNG_HEADER_BASE64));

		final JSONObject objectDiagram1 = responseObj.getJSONArray("objectDiagrams").getJSONObject(1);
		assertThat(objectDiagram1.getString("name"), equalTo("test.svg"));
		assertThat(objectDiagram1.getString("content"), CoreMatchers.startsWith("<?xml"));

		final JSONObject testMethod = responseObj.getJSONArray(Result.PROPERTY_methods).getJSONObject(0);
		assertThat(testMethod.getString("name"), equalTo("void test()"));
		assertThat(testMethod.getString("className"), equalTo("ScenarioTest"));
		assertThat(testMethod.getString("body"), CoreMatchers.startsWith(
			"Student alice = new Student();\n" + "alice.setName(\"Alice\");\n"
			+ "FulibTools.objectDiagrams().dumpPng(\""));
	}

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
