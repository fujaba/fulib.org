package org.fulib.webapp.assignment;

import org.json.JSONObject;
import spark.HaltException;

import java.util.concurrent.Callable;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.Assert.fail;

public class TestHelper
{
	static void expectHalt(int status, String error, Callable<?> runnable) throws Exception
	{
		try
		{
			runnable.call();
			fail("did not throw HaltException");
		}
		catch (HaltException ex)
		{
			assertThat(ex.statusCode(), equalTo(status));
			final JSONObject body = new JSONObject(ex.body());
			assertThat(body.getString("error"), equalTo(error));
		}
	}
}
